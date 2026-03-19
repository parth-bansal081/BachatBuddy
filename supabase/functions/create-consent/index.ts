import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get Setu credentials from environment using specific keys
        const setuClientId = Deno.env.get('5559b715-d5ed-4522-a273-9f0013a6aedb')
        const setuClientSecret = Deno.env.get('gfRYLs9lkWhziHb2mqMga9IfWGy7A6Mn')
        const setuProductId = Deno.env.get('91265302-0e61-4c98-80f9-62bba83530a9')

        // Parse request body for custom redirect URL
        const reqBody = await req.json().catch(() => ({}))
        const { redirectUrl } = reqBody

        // Redirect URL logic
        const setuRedirectUrl = 'https://fintrack-hq.vercel.app/dashboard'

        if (!setuClientId || !setuClientSecret) {
            console.error('Missing Setu credentials')
        }

        // Get user from request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        )

        // Get authenticated user
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        // Generate timestamps
        const now = new Date()
        const consentStart = now.toISOString()
        const consentExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        const dataRangeFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year ago
        const dataRangeTo = now.toISOString()

        // Build consent request body
        const consentRequest = {
            Detail: {
                consentStart,
                consentExpiry,
                Customer: {
                    id: `${user.id}@fintrack`,
                },
                FIDataRange: {
                    from: dataRangeFrom,
                    to: dataRangeTo,
                },
                consentMode: 'STORE',
                consentTypes: ['TRANSACTIONS', 'PROFILE', 'SUMMARY'],
                fetchType: 'ONETIME',
                Frequency: {
                    value: 1,
                    unit: 'YEAR',
                },
                DataFilter: [
                    {
                        type: 'TRANSACTIONAMOUNT',
                        operator: '>=',
                        value: '0',
                    },
                ],
                DataLife: {
                    value: 1,
                    unit: 'YEAR',
                },
                DataConsumer: {
                    id: 'fintrack-app',
                },
                Purpose: {
                    code: '102',
                    text: 'Customer spending patterns and financial insights',
                    Category: {
                        type: 'string',
                    },
                    refUri: 'https://fintrack-hq.vercel.app',
                },
                fiTypes: ['DEPOSIT'],
            },
            redirectUrl: setuRedirectUrl,
            VUA: '9999999999@setu',
            context: [
                {
                    key: 'accounttype',
                    value: 'SAVINGS',
                },
            ],
        }

        // Call Setu API
        const setuResponse = await fetch('https://aa-sandbox.setu.co/v2/consents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': setuClientId,
                'x-client-secret': setuClientSecret,
                'Origin': 'https://fintrack-hq.vercel.app',
                'Referer': 'https://fintrack-hq.vercel.app'
            },
            body: JSON.stringify(consentRequest),
        })

        if (!setuResponse.ok) {
            const errorData = await setuResponse.json().catch(() => ({}))
            console.error('Setu API Error:', errorData)
            throw new Error(errorData.message || `Setu API error: ${setuResponse.status}`)
        }

        const setuData = await setuResponse.json()

        if (!setuData.url || !setuData.id) {
            throw new Error('Invalid response from Setu API')
        }

        // Save consent ID to user_profiles table
        const { error: updateError } = await supabaseClient
            .from('user_profiles')
            .update({
                setu_consent_id: setuData.id,
                setu_consent_status: 'PENDING',
                setu_consent_created_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (updateError) {
            console.error('Error updating user profile:', updateError)
            // Don't fail the request, just log the error
        }

        // Return consent URL and ID
        return new Response(
            JSON.stringify({
                url: setuData.url,
                consentId: setuData.id,
                status: setuData.status || 'PENDING',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error in create-consent function:', error)
        return new Response(
            JSON.stringify({
                error: error.message || 'Internal server error',
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})

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
        const setuClientId = Deno.env.get('SETU_CLIENT_ID');
        const setuClientSecret = Deno.env.get('SETU_CLIENT_SECRET');
        const setuProductId = Deno.env.get('SETU_PRODUCT_INSTANCE_ID');

        // Parse request body for custom redirect URL
        const reqBody = await req.json().catch(() => ({}))
        const { redirectUrl } = reqBody

        // Redirect URL — must match Setu dashboard allow-list
        const setuRedirectUrl = 'https://bachatbuddy-hq.vercel.app/loading-insights'

        if (!setuClientId || !setuClientSecret || !setuProductId) {
            throw new Error('Missing Setu credentials (SETU_CLIENT_ID, SETU_CLIENT_SECRET, or SETU_PRODUCT_INSTANCE_ID)')
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

        // ── Setu V2 Flat Payload — all keys camelCase ─────────────────────
        const consentRequest = {
            consentDateRange: {
                startDate: "2023-04-01T00:00:00Z",
                endDate: "2026-04-01T00:00:00Z",
            },
            consentDuration: { unit: "MONTH", value: 12 },
            consentMode: "STORE",
            consentTypes: ["TRANSACTIONS", "PROFILE", "SUMMARY"],
            fetchType: "PERIODIC",
            frequency: { unit: "MONTH", value: 1 },       // was: Frequency
            // dataConsumer is auto-set by Setu from x-product-instance-id — do NOT include it
            purpose: {                                      // was: Purpose
                category: { type: "string" },              // was: Category
                code: "101",
                refUri: "https://api.rebit.org.in/aa/purpose/101.xml",
                text: "Wealth Management",
            },
            fiTypes: ["DEPOSIT"],
            dataRange: {
                from: "2023-04-01T00:00:00Z",
                to: "2024-04-01T00:00:00Z",
            },
            dataLife: { unit: "MONTH", value: 12 },        // was: DataLife
            vua: Deno.env.get('SETU_TEST_VUA') || "9999999999@onemoney",
            redirectUrl: setuRedirectUrl,
        }
        // ─────────────────────────────────────────────────────────────────

        // Call Setu V2 API
        const setuResponse = await fetch('https://fiu-sandbox.setu.co/v2/consents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': setuClientId!,
                'x-client-secret': setuClientSecret!,
                'x-product-instance-id': setuProductId!,   // Required by V2 — 400 without this
            },
            body: JSON.stringify(consentRequest),
        })

        if (!setuResponse.ok) {
            const errorData = await setuResponse.json().catch(() => ({}))
            console.error('Setu API Error:', JSON.stringify(errorData))
            // Surface full Setu error so the client can see exactly what failed
            return new Response(
                JSON.stringify({ setuError: errorData, status: setuResponse.status }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
            )
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

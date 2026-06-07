import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Signature verification ────────────────────────────────────────────
    const webhookSecret = Deno.env.get('SETU_WEBHOOK_SECRET')
    const incomingSecret = req.headers.get('x-webhook-secret')

    if (webhookSecret && incomingSecret !== webhookSecret) {
      console.error('Webhook secret mismatch')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    console.log('Setu Webhook received:', JSON.stringify(body))

    // ── Extract event fields ──────────────────────────────────────────────
    // Setu AA webhook payload shape:
    // { type: "CONSENT_STATUS_UPDATE" | "FI_DATA_READY", consentId, status, ... }
    const eventType: string = body.type || body.event || ''
    const consentId: string = body.consentId || body.id || body.consent?.id || ''
    const newStatus: string = body.status || body.consent?.status || ''

    if (!consentId) {
      console.warn('No consentId in webhook payload')
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Supabase admin client (service_role for unrestricted writes) ──────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // ── Handle event types ────────────────────────────────────────────────

    if (eventType === 'CONSENT_STATUS_UPDATE' || eventType === 'consent_status_update') {
      // Map Setu status to our status
      const mappedStatus = newStatus.toUpperCase()  // ACTIVE | REVOKED | PAUSED | EXPIRED

      const { error } = await supabase
        .from('user_profiles')
        .update({
          setu_consent_status: mappedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('setu_consent_id', consentId)

      if (error) console.error('Error updating consent status:', error)
      else console.log(`Consent ${consentId} → ${mappedStatus}`)

      // If consent just became ACTIVE, trigger a data fetch immediately
      if (mappedStatus === 'ACTIVE') {
        console.log('Consent ACTIVE — triggering initial data sync...')
        const { error: syncError } = await supabase.functions.invoke('sync-bank-data', {
          body: { mode: 'FETCH_DATA', consentId },
        })
        if (syncError) console.error('Auto-sync failed:', syncError)
        else console.log('Initial sync triggered successfully')
      }
    }

    else if (eventType === 'FI_DATA_READY' || eventType === 'fi_data_ready') {
      // Setu has fetched FI data — trigger our sync function
      console.log(`FI_DATA_READY for consent ${consentId} — syncing...`)
      const { error: syncError } = await supabase.functions.invoke('sync-bank-data', {
        body: { mode: 'FETCH_DATA', consentId },
      })
      if (syncError) console.error('Sync failed on FI_DATA_READY:', syncError)
      else console.log('Sync triggered on FI_DATA_READY')
    }

    else if (eventType === 'CONSENT_REVOKED' || newStatus === 'REVOKED') {
      await supabase
        .from('user_profiles')
        .update({ setu_consent_status: 'REVOKED', updated_at: new Date().toISOString() })
        .eq('setu_consent_id', consentId)
      console.log(`Consent ${consentId} marked REVOKED`)
    }

    else {
      console.log(`Unhandled event type: ${eventType} — ignoring`)
    }

    // Always return 200 so Setu doesn't keep retrying
    return new Response(JSON.stringify({ received: true, consentId, eventType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Webhook handler error:', error)
    // Still return 200 to prevent Setu retries on our own bugs
    return new Response(JSON.stringify({ received: true, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})

/**
 * Setu Account Aggregator Service
 * Handles bank account syncing via Setu's AA API
 */
import { supabase } from "@/integrations/supabase/client";

interface ConsentResponse {
    url: string;
    consentId: string;
    status: string;
}

/**
 * Initiates bank account sync via Setu Account Aggregator
 * Calls the 'create-consent' Edge Function
 */
export async function initiateBankSync(): Promise<ConsentResponse> {
    try {
        const { data, error } = await supabase.functions.invoke('create-consent');

        if (error) {
            console.error("Edge Function Error:", error);
            throw error;
        }

        if (!data || !data.url) {
            throw new Error("No consent URL returned from Setu");
        }

        return {
            url: data.url,
            consentId: data.consentId,
            status: data.status,
        };
    } catch (error: any) {
        console.error("Error initiating bank sync:", error);
        throw new Error(error.message || "Failed to initiate bank sync");
    }
}

/**
 * Opens the consent URL in a new window
 */
/**
 * Opens the consent URL in a new tab
 */
export function openConsentWindow(url: string): Window | null {
    return window.open(url, "_blank");
}

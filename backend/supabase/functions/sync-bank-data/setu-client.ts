export class SetuClient {
    private clientId: string;
    private clientSecret: string;
    private productInstanceId: string;
    private baseUrl: string;

    constructor() {
        this.clientId = Deno.env.get("SETU_CLIENT_ID") || "";
        this.clientSecret = Deno.env.get("SETU_SECRET") || "";
        this.productInstanceId = Deno.env.get("SETU_PRODUCT_INSTANCE_ID") || "";
        if (!this.productInstanceId) {
            console.error("CRITICAL: SETU_PRODUCT_INSTANCE_ID MISSING");
            throw new Error("Misconfiguration: Missing Setu Product ID");
        }
        // Using valid Bridge endpoint - Strictly V2
        this.baseUrl = "https://bridge.setu.co/apps/data/consents";
    }

    private getHeaders() {
        return {
            'x-client-id': this.clientId,
            'x-client-secret': this.clientSecret,
            'x-product-instance-id': this.productInstanceId,
            'Content-Type': 'application/json',
            'Origin': 'https://fintrack-hq.vercel.app',
            'Referer': 'https://fintrack-hq.vercel.app'
        };
    }

    async createConsent(redirectUrl: string) {
        const url = this.baseUrl;

        console.log(`[SetuClient] Creating Consent at ${url}`);
        console.log("Registered Origin:", "https://fintrack-hq.vercel.app");

        // STRICT HARDCODING AS REQUESTED
        const FINAL_REDIRECT_URL = "https://fintrack-hq.vercel.app/dashboard";

        const body = {
            vua: "9999999999@anumati", // Correct Sandbox VUA
            redirectUrl: FINAL_REDIRECT_URL,
            consentMode: "STORE",
            fetchType: "ONETIME",
            consentTypes: ["TRANSACTIONS"],
            fiTypes: ["DEPOSIT"],
            dataRange: {
                from: "2023-04-01T00:00:00Z",
                to: "2024-03-31T00:00:00Z"
            },
            purpose: {
                code: "101",
                text: "Wealth Management",
                refUri: "https://fintrack-hq.vercel.app", // UPDATED REF URI
                category: {
                    type: "PERSONAL_FINANCE"
                }
            },
            dataLife: { unit: "MONTH", value: 12 },
            frequency: { unit: "MONTH", value: 12 }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("[SetuClient] Error:", JSON.stringify(result));
            throw new Error(result.errorMsg || "Setu API Error");
        }

        return result;
    }

    // Placeholder for Real FI Fetch (future proofing)
    async fetchFiData(consentId: string) {
        // Real logic would be:
        // 1. Create FI Request
        // 2. Wait for Notification
        // 3. Fetch FI Data
        // For now, we return 'MOCK' signal to let the controller handler the mock generation
        return { mode: 'MOCK_GENERATION_REQUIRED' };
    }
}

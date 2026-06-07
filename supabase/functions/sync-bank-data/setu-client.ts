export class SetuClient {
    private clientId: string;
    private clientSecret: string;
    private productInstanceId: string;
    private baseUrl: string;

    constructor() {
        this.clientId = Deno.env.get("SETU_CLIENT_ID") || "";
        this.clientSecret = Deno.env.get("SETU_CLIENT_SECRET") || "";
        this.productInstanceId = Deno.env.get("SETU_PRODUCT_INSTANCE_ID") || "";
        if (!this.productInstanceId) {
            throw new Error("Misconfiguration: Missing Setu Product ID");
        }
        this.baseUrl = "https://fiu-sandbox.setu.co/v2";
    }

    private getHeaders() {
        return {
            'x-client-id': this.clientId,
            'x-client-secret': this.clientSecret,
            'x-product-instance-id': this.productInstanceId,
            'Content-Type': 'application/json',
        };
    }

    /**
     * Step 1: Create a FI Data Session for an approved consentId
     * dataRange MUST be within the consent's dataRange (2023-04-01 to 2024-04-01)
     */
    async createDataSession(consentId: string): Promise<string> {
        const body = {
            consentId,
            dataRange: {
                from: "2023-04-01T00:00:00.000Z",
                to: "2024-04-01T00:00:00.000Z",
            },
            format: "json",
        };

        console.log("[Setu] Creating data session for consent:", consentId);
        const res = await fetch(`${this.baseUrl}/sessions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("[Setu] Create session failed:", JSON.stringify(data));
            throw new Error(`Setu session create failed: ${JSON.stringify(data)}`);
        }

        console.log("[Setu] Session created:", data.id, "status:", data.status);
        return data.id;
    }

    /**
     * Step 2: Poll GET /sessions/{id} until data is ready.
     * Setu sandbox statuses: PENDING → PARTIAL/COMPLETED/READY
     * Individual account statuses: PENDING, READY, DELIVERED, FAILED, TIMEOUT, DENIED
     */
    async fetchSessionData(sessionId: string, maxRetries = 20): Promise<any> {
        // Terminal combined session statuses (Setu sandbox may use READY or COMPLETED)
        const DONE_STATUSES = ["COMPLETED", "PARTIAL", "READY"];
        const FAIL_STATUSES = ["FAILED", "TIMEOUT", "EXPIRED"];

        for (let i = 0; i < maxRetries; i++) {
            console.log(`[Setu] Polling session ${sessionId} (attempt ${i + 1}/${maxRetries})`);
            const res = await fetch(`${this.baseUrl}/sessions/${sessionId}`, {
                headers: this.getHeaders(),
            });

            const data = await res.json();
            if (!res.ok) {
                console.error("[Setu] Session poll error:", JSON.stringify(data));
                throw new Error(`Setu session poll failed: ${JSON.stringify(data)}`);
            }

            const status = (data.status || "").toUpperCase();
            console.log(`[Setu] Session status: ${status}`, JSON.stringify(data?.fips?.map((f: any) => ({
                fip: f.fipID,
                accounts: f.accounts?.map((a: any) => ({ status: a.status, masked: a.maskedAccNumber }))
            }))));

            if (DONE_STATUSES.includes(status)) {
                console.log("[Setu] Session complete, returning data");
                return data;
            }

            if (FAIL_STATUSES.includes(status)) {
                throw new Error(`Setu FI session ended with status: ${status}`);
            }

            // Wait 3s between polls (sandbox can be slow)
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        throw new Error(`Setu FI data session timed out after ${maxRetries} retries`);
    }

    /**
     * Full FI data fetch: create session → poll → return raw Setu response
     */
    async fetchFiData(consentId: string): Promise<any> {
        const sessionId = await this.createDataSession(consentId);
        return await this.fetchSessionData(sessionId);
    }
}

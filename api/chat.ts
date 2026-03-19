// Direct Fetch implementation - No SDK
export const config = {
    runtime: 'edge',
    regions: ['iad1'], // Force US East (Washington DC) to avoid regional blocks
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Gemini Key Status:", !!apiKey);

    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY is missing in environment variables.");
        return new Response(JSON.stringify({
            error: "Server Configuration Error: API Key Missing",
            details: "GEMINI_API_KEY not set in Vercel."
        }), {
            status: 500, // Internal Server Error
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { message, context } = await req.json();

        // Dynamic Context Injection (Sanitized by Frontend)
        const systemPrompt = `You are the Emerald Advisor for FinTrack. You have access to the user's real-time data:
Income: ${context.systemStatus}
Goal: ₹${context.savingsTarget}
Daily Burn Rate (Actual): ₹${context.dailyBurnRate} (Avg)
Safe Daily Limit (Target): ₹${context.safeDailySpend}

Recent Activity Log (Last 20):
${JSON.stringify(context.recentTransactions, null, 2)}

Your job is to perform financial analysis. Compare their Daily Burn Rate to the Safe Limit.
Review the 'Recent Activity Log'. Identify top 3 spending categories and any outliers/spikes.
When providing a spending summary, always include a chart at the end. Use this format:

\`\`\`chart
[{"category": "Food", "amount": 18144}, {"category": "Shopping", "amount": 15516}]
\`\`\`

Be concise, professional, and helpful.`;

        // Direct Fetch to Gemini REST API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const googlePayload = {
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\nUser Message: ${message}`
                }]
            }]
        };

        console.log("Payload sent to Google:", JSON.stringify(googlePayload));

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(googlePayload)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorData}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

        return new Response(JSON.stringify({ response: responseText }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error("AI Error:", error);
        return new Response(JSON.stringify({
            error: error.message || 'Failed to process request',
            details: error.toString() // Send details to frontend for debugging
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

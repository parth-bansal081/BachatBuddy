import { supabase } from "@/integrations/supabase/client";

const AI_API_URL = "https://bachatbuddy-ai-brain.loca.lt";

/**
 * MISSION: Deep-Brain Integration
 * Purpose: Commmunicate with the local/deployed CrewAI backend.
 */
export const aiService = {
  async analyzeFinance(transactions: any[]): Promise<string> {
    try {
      if (!transactions || transactions.length === 0) {
        return "I need some transaction data to perform a deep-dive audit. Once you sync your bank, I'll crunch the numbers!";
      }

      // We stringify the JSON because the backend Pydantic model expects a string
      const payload = {
        setu_json: JSON.stringify({ transactions })
      };

      const response = await fetch(`${AI_API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "bypass-tunnel-reminder": "true"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || "AI Backend unreachable");
      }

      const data = await response.json();
      return data.summary; // based on api.py returning {"summary": "..."}
    } catch (error: any) {
      console.error("AI Service Error:", error);
      // Return a professional "AI Down" message
      return "My cognitive circuits are currently disconnected (Backend Error). Please ensure the BachatBuddy AI server is running on port 8000.";
    }
  }
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Brain, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { aiService } from "@/lib/aiService";
import { useQueryClient } from "@tanstack/react-query";

const LoadingInsights = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const steps = [
    { icon: <ShieldCheck className="w-8 h-8 text-green-500" />, text: "Secure connection established with Setu..." },
    { icon: <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />, text: "Fetching your transaction history..." },
    { icon: <Brain className="w-8 h-8 text-purple-500 animate-pulse" />, text: "Connecting to your financial brain..." },
    { icon: <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />, text: "Generating actionable savings insights..." }
  ];

  useEffect(() => {
    // Cycle through steps for visual feedback
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000);

    const performAIAnalysis = async () => {
      try {
        // 1. Fetch data from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: transactions } = await supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: false });

        if (transactions && transactions.length > 0) {
          // 2. Trigger AI Analysis to pre-cache it
          console.log("Triggering AI Engine processing...");
          const result = await aiService.analyzeFinance(transactions);
          
          // 3. Pre-populate react-query cache so Dashboard is instant
          queryClient.setQueryData(["ai-analysis", transactions.length], result);
        }

        // Wait a bit more to let the animation feel "forensic"
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);

      } catch (error) {
        console.error("AI Analysis failed in background:", error);
        navigate("/dashboard"); // Fallback to dashboard regardless
      }
    };

    performAIAnalysis();

    return () => {
      clearInterval(interval);
    };
  }, [navigate, queryClient, steps.length]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-gradient-to-br from-background to-primary/5">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <img src="/BachatBuddy.png" alt="Logo" className="h-20 w-20 relative z-10" />
            </div>
        </div>

        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Analyzing Your Finances</h1>
            <p className="text-muted-foreground">Please wait while BachatBuddy's AI agents crunch the numbers.</p>
        </div>

        <Card className="border-primary/10 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 flex flex-col items-center gap-6">
                <div className="p-4 rounded-full bg-primary/5 border border-primary/10 shadow-inner">
                    {steps[step].icon}
                </div>
                
                <div className="space-y-4 w-full">
                    <p className="text-lg font-medium text-foreground transition-all duration-500">
                        {steps[step].text}
                    </p>
                    
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-primary h-full transition-all duration-1000 ease-out" 
                            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-center">
                    {steps.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === step ? 'bg-primary scale-125' : 'bg-muted'}`} 
                        />
                    ))}
                </div>
            </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground italic">
            "Savings is the gap between your ego and your income."
        </p>
      </div>
    </div>
  );
};

export default LoadingInsights;

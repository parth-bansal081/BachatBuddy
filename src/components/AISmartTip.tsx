import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface AISmartTipProps {
    income: number;
    savingsTarget: number;
    totalSpent: number;
    unpaidBills: number;
}

export function AISmartTip({ income, savingsTarget, totalSpent, unpaidBills }: AISmartTipProps) {
    const [tip, setTip] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTip = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("get-smart-tip", {
                body: { income, savingsTarget, totalSpent, unpaidBills }
            });
            if (error) throw error;
            setTip(data.tip);
        } catch (err) {
            console.error("Error fetching AI tip:", err);
            setTip("Your coach is currently at a yoga retreat. Try again in a bit!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTip();
    }, [income, savingsTarget]); // Initial fetch when key profile metrics load

    return (
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 overflow-hidden relative group shadow-sm transition-all duration-300 hover:shadow-md">
            <CardContent className="p-4 flex items-start gap-4">
                <div className="shrink-0 relative">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 animate-pulse-slow">
                        <Bot className="h-7 w-7 text-indigo-500" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-500/80">
                            AI Financial Coach
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-indigo-500/10 text-indigo-500/60 hover:text-indigo-500 transition-colors"
                            onClick={fetchTip}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>

                    <div className="relative">
                        {loading && !tip ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 italic">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Crunching numbers for you...
                            </div>
                        ) : (
                            <div className="relative animate-in fade-in slide-in-from-left-2 duration-500">
                                <div className="absolute -left-2 top-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white/40 dark:border-r-slate-800 border-b-[6px] border-b-transparent" />
                                <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none border border-white/20 dark:border-white/5 shadow-sm">
                                    <p className="text-sm font-medium leading-relaxed text-foreground/90">
                                        "{tip}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Subtle background decoration */}
                <div className="absolute -bottom-4 -right-4 opacity-5 transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <Sparkles className="h-20 w-20" />
                </div>
            </CardContent>
        </Card>
    );
}

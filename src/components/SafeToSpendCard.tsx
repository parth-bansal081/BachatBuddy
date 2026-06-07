import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/data";
import { Wallet, Info } from "lucide-react";
import { getDaysInMonth, getDate } from "date-fns";
import { calculateSafeToSpend } from "@/utils/financialPhysics";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SafeToSpendCardProps {
    income: number;
    savingsTarget: number;
    totalSpent: number;
    currencySymbol?: string;
    currencyCode?: string;
}

export function SafeToSpendCard({
    income,
    savingsTarget,
    totalSpent,
    currencyCode = "INR",
    currencySymbol = "₹",
}: SafeToSpendCardProps) {
    const now = new Date();
    const totalDaysInMonth = getDaysInMonth(now);
    const currentDay = getDate(now);

    const { dailySafeAmount, availableFunds, remainingDays } = calculateSafeToSpend(income, savingsTarget, totalSpent);

    return (
        <SpotlightCard
            className="border-2 border-primary bg-primary text-white shadow-[6px_6px_0px_0px_rgba(20,184,166,0.3)] hover:shadow-[8px_8px_0px_0px_rgba(20,184,166,0.5)]"
            spotlightColor="rgba(255, 255, 255, 0.15)"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet className="w-32 h-32 text-white" />
            </div>

            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-bold text-teal-100 uppercase tracking-widest flex items-center gap-2">
                    Daily Safe-to-Spend
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-teal-200" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-slate-900 border-2 border-slate-900 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                Calculated as (Income - Savings Goal - Spent) / Days Remaining
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
                <div className="flex flex-col gap-1">
                    <div className={`text-5xl font-black text-white tracking-tight`}>
                        {formatCurrency(dailySafeAmount, currencyCode)}
                    </div>
                    <p className="text-sm text-teal-50 font-medium">
                        <span className="bg-white/20 px-1 rounded text-white font-bold">{formatCurrency(availableFunds, currencyCode)}</span> remaining for <span className="underline decoration-2 decoration-teal-300">{remainingDays} days</span>.
                    </p>
                </div>

                {/* Progress bar visual - Solid Block Style */}
                <div className="mt-4 h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/10">
                    <div
                        className="h-full bg-accent border-r-2 border-black/10"
                        style={{ width: `${Math.min(100, (remainingDays / totalDaysInMonth) * 100)}%` }}
                    />
                </div>
            </CardContent>
        </SpotlightCard>
    );
}

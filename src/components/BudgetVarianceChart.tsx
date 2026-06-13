import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BudgetVarianceChartProps {
    data: {
        category: string;
        expected: number;
        actual: number;
    }[];
    currencyCode?: string;
}

// 📦 BOTH named and default exports are provided here so Dashboard.tsx can't possibly fail to link it
export function BudgetVarianceChart({ data }: BudgetVarianceChartProps) {
    
    const formatINR = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <Card className="card-pop h-full shadow-none bg-[#131C2E]/40 border border-white/5 flex flex-col justify-between">
            <CardHeader className="pb-3 pt-5 border-b border-white/[0.03]">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-black tracking-tight text-white">
                        Real vs. Expected Spending
                    </CardTitle>
                    <div className="flex items-center gap-3 text-[10px] text-[#64748B] font-bold tracking-wider uppercase">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-[#334155]" /> Budget
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-[#00F5D4]" /> Spent
                        </div>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="px-6 pt-5 pb-6">
                <div className="space-y-[19px] w-full">
                    {(data || []).map((item, index) => {
                        const percentage = item.expected > 0 ? Math.min((item.actual / item.expected) * 100, 100) : 0;
                        const isOverBudget = item.actual > item.expected;

                        return (
                            <div key={index} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-white tracking-wide">{item.category}</span>
                                    <span className="text-xs text-[#94A3B8] font-semibold">
                                        <strong className={isOverBudget ? "text-red-400 font-bold" : "text-[#00F5D4] font-bold"}>
                                            {formatINR(item.actual)}
                                        </strong>
                                        <span className="mx-1 text-[#334155]">/</span>
                                        {formatINR(item.expected)}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                                            isOverBudget ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-[#00F5D4]"
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// ⚡ ULTIMATE FALLBACK: If Dashboard.tsx imports this without curly braces, this line intercepts and saves it
export default BudgetVarianceChart;
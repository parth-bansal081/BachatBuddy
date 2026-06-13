import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
    id: string;
    description: string;
    date: string;
    category: string;
    amount: number;
}

interface RecentTransactionsListProps {
    transactions: Transaction[];
}

// ✅ FIXED NAME: Component name matches what Dashboard.tsx line 25 expects perfectly
export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
    
    const parseTransaction = (rawStr: string) => {
        if (!rawStr) return { type: "TXN", cleanName: "External Transaction" };
        
        const parts = rawStr.split("/");
        const type = parts[0] || "TXN";
        
        let cleanName = parts.find(part => 
            part && 
            part !== "DE" && 
            part !== "CR" && 
            isNaN(Number(part)) && 
            part.length > 3
        ) || parts[parts.length - 1] || "Transfer";

        cleanName = cleanName.replace(/[0-9]/g, '').trim();

        return { type, cleanName };
    };

    const formatINR = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(Math.abs(value));
    };

    return (
        <Card className="card-pop h-full shadow-none bg-[#131C2E]/40 border border-white/5 flex flex-col justify-between">
            <CardHeader className="pb-3 pt-5 border-b border-white/[0.03] flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-black tracking-tight text-white">
                    Recent Transactions
                </CardTitle>
                <button className="text-xs font-bold text-[#00F5D4] hover:underline transition-all">
                    View All →
                </button>
            </CardHeader>

            <CardContent className="px-5 pt-4 pb-5 flex-1">
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                    {(transactions || []).slice(0, 5).map((txn) => {
                        const { type, cleanName } = parseTransaction(txn.description);
                        const isIncome = txn.amount > 0;

                        return (
                            <div key={txn.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/[0.02] hover:bg-white/[0.03] transition-all duration-200">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                                        isIncome 
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                            : "bg-red-500/10 border-red-500/20 text-red-400"
                                    }`}>
                                        {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate tracking-wide max-w-[180px] md:max-w-[220px]">
                                            {cleanName}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#64748B] font-medium">
                                            <span className="bg-white/5 px-1.5 py-0.2 rounded font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">
                                                {type}
                                            </span>
                                            <span>•</span>
                                            <span>{txn.date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0 pl-2">
                                    <p className={`text-sm font-mono font-bold ${isIncome ? "text-emerald-400" : "text-white"}`}>
                                        {isIncome ? "+" : "-"} {formatINR(txn.amount)}
                                    </p>
                                    <p className="text-[10px] text-[#64748B] font-semibold tracking-wide mt-0.5 uppercase">
                                        {txn.category}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// ⚡ BACKUP FALLBACK EXPORT
export default RecentTransactionsList;
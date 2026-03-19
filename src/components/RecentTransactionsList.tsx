import { Transaction } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ArrowRight, ShoppingBag, Coffee, Home, Zap, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RecentTransactionsListProps {
    transactions: Transaction[];
    currencyCode?: string;
    limit?: number;
}

const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('shop')) return ShoppingBag;
    if (c.includes('food') || c.includes('dining')) return Coffee;
    if (c.includes('rent') || c.includes('home')) return Home;
    if (c.includes('bill') || c.includes('util')) return Zap;
    if (c.includes('transport') || c.includes('fuel')) return Car;
    return ShoppingBag;
};

export function RecentTransactionsList({ transactions, currencyCode = "INR", limit = 5 }: RecentTransactionsListProps) {
    const navigate = useNavigate();
    const displayTransactions = transactions.slice(0, limit);

    return (
        <Card className="col-span-1 border-muted/50">
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")} className="gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {displayTransactions.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No recent transactions</p>
                    ) : (
                        displayTransactions.map((transaction) => {
                            const Icon = getCategoryIcon(transaction.category);
                            return (
                                <div key={transaction.id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                                {transaction.merchant}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(parseISO(transaction.date), "MMM d, yyyy")} • {transaction.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="font-semibold">
                                        {transaction.amount.toLocaleString('en-IN', {
                                            style: 'currency',
                                            currency: currencyCode
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

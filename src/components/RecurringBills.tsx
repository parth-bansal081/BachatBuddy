import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Calendar } from "lucide-react";
import { MotionWrapper } from "@/components/MotionWrapper";

interface RecurringBillsProps {
  currencyCode?: string;
  className?: string;
}

export const RecurringBills = ({ currencyCode = "INR", className = "" }: RecurringBillsProps) => {
  // Placeholder structure matching your active app state tracking
  const [bills] = useState([
    { id: "1", name: "Streaming Subscription", amount: 499, dueDate: "Every 15th" },
    { id: "2", name: "Cloud Infrastructure", amount: 1250, dueDate: "Every 22nd" }
  ]);

  return (
    <Card className={`card-glass rounded-xl border border-white/5 bg-[#131C2E]/30 shadow-elevation-2 ${className}`}>
      <CardContent className="p-5">
        {/* Clean, Senior-Level Header Typography Balancing */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.04] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-white">Recurring Bills</h3>
              <p className="text-[11px] text-muted-foreground">Fixed monthly commitments</p>
            </div>
          </div>
          <Button size="sm" variant="secondary" className="h-8 gap-1 text-xs px-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/5">
            <Plus className="h-3.5 w-3.5" />
            Add Bill
          </Button>
        </div>

        {/* Dynamic Bills Feed Track */}
        <div className="space-y-2.5">
          {bills.length === 0 ? (
            <div className="py-6 text-center bg-white/[0.01] rounded-lg border border-dashed border-white/5">
              <p className="text-xs text-muted-foreground">No active tracking subscriptions found.</p>
            </div>
          ) : (
            bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] transition-all hover:bg-white/[0.04]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-md bg-white/5 text-muted-foreground shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-white truncate">{bill.name}</p>
                    <p className="text-[10px] text-muted-foreground">{bill.dueDate}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <p className="text-xs font-bold text-white">
                    {currencyCode === "INR" ? "₹" : "$"}
                    {bill.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
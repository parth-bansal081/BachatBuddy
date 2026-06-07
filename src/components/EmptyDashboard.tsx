import { Landmark, BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import { BankSyncButton } from "@/components/BankSyncButton";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: <Landmark className="h-5 w-5 text-blue-400" />,
    title: "Link Your Bank",
    desc: "Securely connect via RBI-approved Account Aggregator",
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    title: "Approve Data Sharing",
    desc: "One-time OTP consent — you control what's shared",
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-purple-400" />,
    title: "Get AI Insights",
    desc: "Spend patterns, savings goals & smart alerts — live",
  },
];

export const EmptyDashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Glowing orb background */}
      <div className="relative mb-10">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150 animate-pulse" />
        <div className="relative flex items-center justify-center h-28 w-28 rounded-full bg-gradient-to-br from-primary/30 via-blue-500/20 to-purple-500/20 border border-primary/20 shadow-xl">
          <Sparkles className="h-12 w-12 text-primary drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
        Your vault is empty
      </h2>
      <p className="text-muted-foreground text-center max-w-sm mb-10 text-base">
        Link your bank account once and BachatBuddy will automatically sync your
        transactions and turn them into insights.
      </p>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        {steps.map((step, i) => (
          <Card
            key={i}
            className="glass-card border-white/5 hover:border-primary/30 transition-all duration-300 group"
          >
            <CardContent className="flex flex-col items-center text-center p-5 gap-3">
              <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                {step.icon}
              </div>
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full max-w-xs">
        <BankSyncButton
          className="w-full h-14 text-base font-bold border-primary/40 hover:border-primary bg-primary/10 hover:bg-primary/20 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
        />
      </div>

      <p className="mt-6 text-xs text-muted-foreground/60 text-center max-w-xs">
        🔒 256-bit encrypted · RBI Account Aggregator framework · Read-only access
      </p>
    </div>
  );
};

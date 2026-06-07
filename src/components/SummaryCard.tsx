import { ReactNode, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Input } from "@/components/ui/input";
import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/data";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  editable?: boolean;
  onValueChange?: (value: number) => void;
  valueClassName?: string;
  className?: string;
  currencyCode?: string;
}

const variantStyles = {
  default: "bg-card/40 backdrop-blur-md",
  primary: "bg-primary/10 border-primary/20",
  success: "bg-emerald-500/10 border-emerald-500/20",
  warning: "bg-amber-500/10 border-amber-500/20",
  destructive: "bg-red-500/10 border-red-500/20",
};

export function SummaryCard({
  title,
  value,
  icon,
  variant = "default",
  editable = false,
  onValueChange,
  valueClassName,
  className,
  currencyCode,
}: SummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const handleSave = () => {
    const numValue = parseFloat(inputValue.replace(/,/g, ""));
    if (!isNaN(numValue) && onValueChange) {
      onValueChange(numValue);
    }
    setIsEditing(false);
  };

  return (
    <SpotlightCard
      className={`overflow-hidden ${variantStyles[variant]} ${className || ""}`}
      spotlightColor="rgba(20, 184, 166, 0.15)"
    >
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] ${variant === 'primary'
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-white/5 border-white/10 text-slate-200'
              }`}>
              {icon}
            </div>
            <p className="text-sm font-medium text-muted-foreground/80 tracking-wide uppercase text-[10px]">{title}</p>
          </div>
          {editable && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {editable && isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={handleSave}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-4 relative z-10">
          {isEditing ? (
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="text-3xl font-bold h-auto py-1 bg-transparent border-b border-primary/50 rounded-none focus-visible:ring-0 px-0"
              autoFocus
            />
          ) : (
            <p className={`text-3xl font-bold tracking-tight text-foreground ${valueClassName}`}>
              {formatCurrency(value, currencyCode)}
            </p>
          )}
        </div>
      </CardContent>
    </SpotlightCard>
  );
}

import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Input } from "@/components/ui/input";
import { Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/data";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  editable?: boolean;
  onValueChange?: (value: number) => void;
  valueClassName?: string;
  className?: string;
  currencyCode?: string;
}

const variantAccent = {
  default: "border-l-primary/20",
  primary: "border-l-primary",
  success: "border-l-success",
  warning: "border-l-warning",
  destructive: "border-l-destructive",
};

const variantIconBg = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
};

export function SummaryCard({
  title,
  value,
  icon,
  variant = "default",
  editable = false,
  onValueChange,
  className,
  currencyCode,
}: SummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSave = () => {
    const numValue = parseFloat(inputValue.replace(/,/g, ""));
    if (!isNaN(numValue) && onValueChange) onValueChange(numValue);
    setIsEditing(false);
  };

  return (
    <SpotlightCard className={cn("h-full", className)}>
      <CardContent className="p-5 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${variantIconBg[variant]}`}>
              {icon}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {title}
            </span>
          </div>
          {editable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground/50 hover:text-foreground"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
        <div className="mt-auto pt-4 flex-1 flex items-center">
          {isEditing ? (
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="text-2xl font-bold h-auto py-1 bg-transparent border-b-2 border-primary/40 rounded-none focus-visible:ring-0 px-0 w-full"
              autoFocus
            />
          ) : (
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(value, currencyCode)}
            </p>
          )}
        </div>
      </CardContent>
    </SpotlightCard>
  );
}
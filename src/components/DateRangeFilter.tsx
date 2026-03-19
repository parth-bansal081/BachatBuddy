import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

export type DateRange = "7d" | "1m" | "all";

interface DateRangeFilterProps {
    selectedRange: DateRange;
    onRangeChange: (range: DateRange) => void;
}

export function DateRangeFilter({ selectedRange, onRangeChange }: DateRangeFilterProps) {
    return (
        <Select value={selectedRange} onValueChange={(val) => onRangeChange(val as DateRange)}>
            <SelectTrigger className="w-[180px] bg-background border-primary/20">
                <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="7d">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary/70" />
                        <span>Last 7 Days</span>
                    </div>
                </SelectItem>
                <SelectItem value="1m">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary/70" />
                        <span>This Month</span>
                    </div>
                </SelectItem>
                <SelectItem value="all">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary/70" />
                        <span>All Time</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}

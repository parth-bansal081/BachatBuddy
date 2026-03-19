import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Landmark } from "lucide-react";

interface AccountSwitcherProps {
    selectedAccountId: string;
    onAccountChange: (id: string) => void;
}

export function AccountSwitcher({ selectedAccountId, onAccountChange }: AccountSwitcherProps) {
    const { data: accounts = [] } = useQuery({
        queryKey: ["accounts"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase.from("accounts").select("*").eq("user_id", user.id);
            if (error) throw error;
            return data || [];
        },
    });

    return (
        <Select value={selectedAccountId} onValueChange={onAccountChange}>
            <SelectTrigger className="w-[200px] bg-background border-primary/20">
                <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">
                    <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        <span>All Accounts</span>
                    </div>
                </SelectItem>
                {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary/70" />
                            <span>{account.account_name}</span>
                            {account.last_four && (
                                <span className="text-xs text-muted-foreground">
                                    (****{account.last_four})
                                </span>
                            )}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

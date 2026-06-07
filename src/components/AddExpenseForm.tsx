import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Category, Transaction } from "@/lib/data";

const formSchema = z.object({
    merchant: z.string().min(2, "Merchant name must be at least 2 characters"),
    amount: z.coerce.number().positive("Amount must be positive"),
    date: z.date(),
    category: z.enum(["Groceries", "Eating Out", "Rent", "EMI", "Transport", "Other"] as const),
});

export function AddExpenseForm({
    onSuccess,
    initialData
}: {
    onSuccess?: () => void;
    initialData?: Transaction & { date: Date | string };
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            merchant: initialData?.merchant || "",
            amount: initialData?.amount || 0,
            date: initialData?.date ? new Date(initialData.date) : new Date(),
            category: (initialData?.category as any) || "Other",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to manage transactions");
                return;
            }

            const payload = {
                merchant: values.merchant,
                amount: values.amount,
                date: format(values.date, "yyyy-MM-dd"),
                category: values.category,
                user_id: user.id,
            };

            if (initialData?.id) {
                const { error } = await supabase
                    .from("transactions")
                    .update(payload)
                    .eq("id", initialData.id);
                if (error) throw error;
                toast.success("Transaction updated successfully");
            } else {
                const { error } = await supabase.from("transactions").insert(payload);
                if (error) throw error;
                toast.success("Expense added successfully");
            }
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            onSuccess?.();
        } catch (error: any) {
            console.error("Error adding expense:", error);
            const errorMessage = error?.message || (typeof error === 'string' ? error : "Unknown error occurred");
            toast.error(`Failed to add expense: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="merchant"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Merchant Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Walmart, Uber" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Groceries">Groceries</SelectItem>
                                        <SelectItem value="Eating Out">Eating Out</SelectItem>
                                        <SelectItem value="Rent">Rent</SelectItem>
                                        <SelectItem value="EMI">EMI</SelectItem>
                                        <SelectItem value="Transport">Transport</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                        </>
                    ) : (
                        "Save Expense"
                    )}
                </Button>
            </form>
        </Form>
    );
}

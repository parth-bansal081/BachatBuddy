import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/data";

interface BudgetVarianceChartProps {
    data: {
        category: string;
        expected: number;
        actual: number;
    }[];
    currencyCode?: string;
}

export function BudgetVarianceChart({ data, currencyCode = "INR" }: BudgetVarianceChartProps) {
    return (
        <Card className="card-pop h-full shadow-none">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    Real vs. Expected Spending
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <XAxis
                                dataKey="category"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value}`}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '2px solid #000',
                                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                                    borderRadius: '8px',
                                    fontWeight: 'bold'
                                }}
                                formatter={(value: number) => [formatCurrency(value, currencyCode), ""]}
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                            />
                            <Legend />
                            <Bar dataKey="expected" name="Expected" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="actual" name="Actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

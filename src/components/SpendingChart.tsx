import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/data";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface SpendingChartProps {
  data: any[];
  xAxisKey?: string;
}

export function SpendingChart({ data, xAxisKey = "category" }: SpendingChartProps) {
  return (
    <SpotlightCard className="shadow-none p-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
          <div className="h-3 w-3 bg-primary rounded-sm rotate-45" />
          Spending Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey={xAxisKey}
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
                formatter={(value: number) => [formatCurrency(value), 'Spent']}
              />
              <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </SpotlightCard>
  );
}

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface SpendingTrendsChartProps {
  data: { date: string; amount: number }[];
  currencySymbol?: string;
  className?: string;
}

export function SpendingTrendsChart({
  data,
  currencySymbol = "₹",
  className = "",
}: SpendingTrendsChartProps) {
  // Safe sorting of data just in case
  const sortedData = useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      // If dates can be parsed, sort chronologically, otherwise keep original order
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return isNaN(timeA) || isNaN(timeB) ? 0 : timeA - timeB;
    });
  }, [data]);

  // Custom Tooltip component to match the screenshot: white box with bold text and strong offset shadow
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const currentPoint = payload[0].payload;
      return (
        <div className="bg-white border-2 border-slate-950 rounded-xl p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.85)] text-slate-900 animate-in fade-in zoom-in-95 duration-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {currentPoint.date}
          </p>
          <p className="text-sm font-black text-teal-600">
            Spent : {currencySymbol}{Number(currentPoint.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Cursor to draw a clean vertical line at the active index
  const CustomCursor = (props: any) => {
    const { points, height } = props;
    if (!points || !points.length) return null;
    const { x } = points[0];
    return (
      <line
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth={1.5}
      />
    );
  };

  // Custom Dot showing a white core with a thick teal stroke on hover
  const renderActiveDot = (props: any) => {
    const { cx, cy } = props;
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={7}
          fill="#ffffff"
          stroke="#14b8a6"
          strokeWidth={3}
          className="filter drop-shadow-[0_0_4px_rgba(20,184,166,0.5)]"
        />
      </g>
    );
  };

  if (!sortedData || sortedData.length === 0) {
    return (
      <Card className={`card-glass p-6 ${className}`}>
        <CardContent className="h-[300px] flex flex-col items-center justify-center text-center">
          <div className="h-2 w-2 rounded-full bg-teal-400 mb-2 animate-ping" />
          <p className="text-muted-foreground text-sm font-medium">No spending trends found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-glass overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_#14b8a6] animate-pulse" />
          <h3 className="text-lg font-bold tracking-tight text-foreground">Spending Trends</h3>
        </div>

        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sortedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
                tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(value) => `${currencySymbol}${value}`}
                tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={<CustomCursor />}
                allowEscapeViewBox={{ x: false, y: true }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#14b8a6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAmount)"
                activeDot={renderActiveDot}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

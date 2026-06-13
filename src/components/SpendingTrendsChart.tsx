import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SpendingTrendsChartProps {
  data: { date: string; amount: number }[];
  currencySymbol?: string;
  className?: string;
}

export const SpendingTrendsChart = ({ data, currencySymbol = "₹", className = "" }: SpendingTrendsChartProps) => {
  
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { date: "Jan 19", amount: 420 },
        { date: "Mar 11", amount: 200 },
        { date: "Apr 12", amount: 400 },
        { date: "May 14", amount: 300 },
        { date: "Jul 04", amount: 450 }
      ];
    }
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  return (
    <div className={`w-full h-full flex flex-col justify-between relative overflow-visible ${className}`}>
      {/* Header Info Panel */}
      <div className="flex items-center gap-2 mb-4 select-none">
        <div className="h-2 w-2 rounded-full bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]" />
        <h3 className="text-sm font-semibold tracking-tight text-white">Spending Trends</h3>
      </div>

      {/* Primary SVG Rendering Field */}
      <div className="flex-1 w-full min-h-0 block relative overflow-visible">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sortedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
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
              tick={{ fill: "rgba(148, 163, 184, 0.7)", fontWeight: 500 }}
            />
            
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => `${currencySymbol}${value}`}
              tick={{ fill: "rgba(148, 163, 184, 0.7)", fontWeight: 500 }}
            />

            <Tooltip
              allowEscapeViewBox={{ x: true, y: true }}
              content={({ active, payload, label, coordinate }) => {
                if (active && payload && payload.length) {
                  const tooltipY = coordinate ? Math.max(10, coordinate.y - 85) : 0;
                  const tooltipX = coordinate ? coordinate.x + 15 : 0;
                  const rawValue = payload[0].value as number;

                  return (
                    <div 
                      className="absolute pointer-events-none bg-white text-black p-2.5 rounded-lg border-2 border-black font-bold text-[11px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap z-50"
                      style={{ 
                        left: `${tooltipX}px`, 
                        top: `${tooltipY}px`,
                        transform: 'translateY(-50%)'
                      }}
                    >
                      <p className="text-gray-400 font-medium mb-0.5">{label}</p>
                      <p className="text-black font-black">
                        Spent: <span className="text-[#14b8a6]">{currencySymbol}{rawValue.toLocaleString("en-IN")}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#14b8a6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAmount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingTrendsChart;
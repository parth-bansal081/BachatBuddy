import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SpendingTrendsChartProps {
  data: { date: string; amount: number }[];
  currencySymbol?: string;
  className?: string;
}

export const SpendingTrendsChart = ({ data, currencySymbol = "₹", className = "" }: SpendingTrendsChartProps) => {
  
  // Safe baseline data fallback array
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { date: "Jan 19", amount: 420 },
        { date: "Mar 09", amount: 200 },
        { date: "Mar 25", amount: 400 },
        { date: "Apr 16", amount: 300 },
        { date: "May 11", amount: 450 }
      ];
    }
    return data;
  }, [data]);

  return (
    <div className={`w-full h-full flex flex-col justify-between ${className}`}>
      {/* Header Panel Tracker */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]" />
        <h3 className="text-sm font-semibold tracking-tight text-white">Spending Trends</h3>
      </div>

      {/* Primary SVG Rendering Canvas */}
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F5D4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00F5D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            
            <YAxis 
              stroke="#64748B" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => `${currencySymbol}${val}`}
            />

            {/* ⚡ INDEPENDENT CORE PORTAL TOOLTIP */}
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
                        Spent: <span className="text-emerald-600">{currencySymbol}{rawValue.toLocaleString("en-IN")}</span>
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
              stroke="#00F5D4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#spendingGradient)"
              activeDot={{ r: 5, strokeWidth: 0, fill: '#00F5D4' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingTrendsChart;
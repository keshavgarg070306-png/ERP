import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  name: string;
  revenue: number;
  expenses: number;
}

interface AreaChartProps {
  data: ChartDataPoint[];
}

export const AreaChart: React.FC<AreaChartProps> = ({ data }) => {
  const formatCurrency = (val: number) => {
    return `$${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="w-full h-80 font-mono text-[10px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {/* Indigo Gradient */}
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F6EF7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0.0} />
            </linearGradient>
            {/* Teal Gradient */}
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1E2130" opacity={0.5} vertical={false} />
          
          <XAxis 
            dataKey="name" 
            stroke="#636B85" 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          
          <YAxis 
            stroke="#636B85" 
            tickLine={false} 
            axisLine={false}
            tickFormatter={formatCurrency}
            dx={-10}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#12141A', 
              borderColor: '#1E2130',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: '#E8EAF0'
            }}
            itemStyle={{ color: '#E8EAF0' }}
            cursor={{ stroke: '#1E2130', strokeWidth: 1 }}
          />

          {/* Revenue Area (Indigo) */}
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#4F6EF7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            isAnimationActive={true}
            animationDuration={1000}
          />

          {/* Expenses Area (Teal) */}
          <Area
            type="monotone"
            dataKey="expenses"
            name="Operating Cost"
            stroke="#00D4AA"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorExpenses)"
            isAnimationActive={true}
            animationDuration={1000}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

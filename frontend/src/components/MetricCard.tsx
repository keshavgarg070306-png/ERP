import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: number; // positive or negative percentage
  sparkline: number[];
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  trend,
  sparkline,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Count-up animation on mount (0 to value over 800ms)
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      const currentVal = start + (end - start) * easeProgress;
      
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formatNumber = (val: number) => {
    // If integer, display clean, if decimal, display 2 decimals
    if (val % 1 === 0) {
      return val.toLocaleString();
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isTrendPositive = trend >= 0;
  // Format sparkline data for Recharts
  const chartData = sparkline.map((val, idx) => ({ id: idx, val }));

  return (
    <div className="glass-card p-5 flex flex-col justify-between h-40">
      {/* Label and Trend */}
      <div className="flex justify-between items-start">
        <span className="text-text-muted text-xs font-mono uppercase tracking-wider">{label}</span>
        
        <span className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
          isTrendPositive 
            ? 'text-success bg-success/10 border border-success/20' 
            : 'text-danger bg-danger/10 border border-danger/20'
        }`}>
          {isTrendPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isTrendPositive ? '+' : ''}{trend.toFixed(1)}%
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="my-2">
        <h2 className="text-3xl font-bold font-mono tracking-tight tabular-nums text-text-primary">
          {prefix}{formatNumber(displayValue)}{suffix}
        </h2>
      </div>

      {/* Recharts Mini Sparkline */}
      <div className="h-10 w-full overflow-hidden mt-1 opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="val"
              stroke={isTrendPositive ? '#00D4AA' : '#E8453C'}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={true}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

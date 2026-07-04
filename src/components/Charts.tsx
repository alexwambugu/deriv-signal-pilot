import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

export const DigitFrequencyChart = ({ data }: { data: { digit: number, percentage: number }[] }) => {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border h-[300px] flex flex-col">
      <h3 className="font-semibold mb-6 text-sm flex justify-between items-center">
        Digit Frequency Analysis
        <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-normal uppercase tracking-wider">Last 100 Ticks</span>
      </h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="digit" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border border-border px-3 py-2 rounded-lg shadow-xl text-xs font-bold">
                      {payload[0].value?.toString().slice(0, 4)}%
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.percentage > 12 ? 'var(--primary)' : 'var(--muted-foreground)'} 
                  fillOpacity={entry.percentage > 12 ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

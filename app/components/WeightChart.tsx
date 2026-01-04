'use client'

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

// Defined ranges for the selector pills
const ranges = [
  { label: '1W', value: '7' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '1Y', value: '365' },
];

export default function WeightChart() {
  const [range, setRange] = useState('30');

  // Fetching data specifically for the chart and history table
  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['chart-entries', range], // Auto-refetches when range changes
    queryFn: async () => {
      const res = await fetch(`/api/entries/chart?range=${range}`);
      if (!res.ok) throw new Error('Failed to fetch chart data');
      return res.json();
    },
    placeholderData: (previousData) => previousData, // Smoother transitions between ranges
  });

  // Custom Tooltip to match the "Twisty" aesthetic
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-zinc-100 flex flex-col gap-2">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">
            {payload[0].payload.date}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <p className="text-zinc-900 font-black text-lg">
              {payload[0].value} <span className="text-zinc-300 text-sm">kg</span>
            </p>
          </div>
          {payload[1] && (
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <p className="text-zinc-600 font-bold text-sm">
                Avg: {payload[1].value}kg
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-12 lg:col-span-8 bg-white p-12 rounded-[3.5rem] shadow-sm border border-zinc-200/50"
    >
      {/* Header & Range Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Weight Trend</h3>
          <p className="text-zinc-400 font-bold text-sm mt-1 uppercase tracking-widest">Historical Progress</p>
        </div>

        <div className="flex bg-zinc-50 p-1.5 rounded-full border border-zinc-100">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-6 py-2 rounded-full text-xs font-black transition-all ${range === r.value
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className={`h-80 w-full  transition-opacity duration-300 ${isPlaceholderData ? 'opacity-50' : 'opacity-100'}`}>
        {isLoading && !data ? (
          <div className="h-full w-full flex items-center justify-center font-black text-zinc-200 animate-pulse">
            LOADING CHART...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.chartData}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F1F4" />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
                tick={{ fill: '#D1D1D6', fontSize: 11, fontWeight: 800 }}
                dy={10}
              />

              <YAxis
                orientation="right"
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tickFormatter={(value) => `${Math.round(value)}kg`}
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{
                  fill: '#D1D1D6',
                  fontSize: 11,
                  fontWeight: 800
                }}
                dx={10}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
              />

              {/* Raw Weight Area */}
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#6366f1"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#chartGradient)"
                animationDuration={1000}
              />

              {/* 7-Day Rolling Trend Line */}
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

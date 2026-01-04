'use client'
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Metrics() {
  const [range] = useState('30');

  const { data, isLoading } = useQuery({
    queryKey: ['metric-entries', range],
    queryFn: async () => {
      // Ensure this endpoint matches your specific metrics route
      const res = await fetch(`/api/entries/metrics?range=${range}`);
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },
  });

  if (isLoading) return <MetricsSkeleton />;

  const isLoss = data?.rateOfChange < 0;
  const isGain = data?.rateOfChange > 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* Weight Status: Adjusted padding and flex for editorial look */}
      <motion.div className="bg-white p-8 rounded-[3rem] shadow-sm border border-zinc-200/50 relative overflow-hidden group flex flex-col justify-between min-h-[160px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">Weight Status</span>
        <div className="relative z-10 flex items-baseline">
          <span className="text-6xl font-black text-zinc-900 leading-none tracking-tighter italic">
            {data?.currentWeight || '0.0'}
          </span>
          <span className="text-xl font-black text-zinc-300 ml-2">kg</span>
        </div>
      </motion.div>

      {/* Rate of Change: Added whitespace-nowrap to prevent text wrapping */}
      <motion.div className="bg-white p-8 rounded-[3rem] shadow-sm border border-zinc-200/50 flex items-center justify-between group min-h-[160px]">
        <div className="flex flex-col whitespace-nowrap">
          <p className="font-black text-lg text-zinc-900 tracking-tight leading-none">Rate of</p>
          <p className="font-black text-lg text-zinc-400 tracking-tight leading-none mt-1">Change</p>
        </div>
        <div className={`flex-shrink-0 px-6 py-4 rounded-[2rem] font-black text-3xl transition-all ${isLoss ? 'bg-emerald-50 text-emerald-600' : isGain ? 'bg-rose-50 text-rose-600' : 'bg-zinc-50 text-zinc-400'
          }`}>
          {isLoss ? '' : isGain ? '+' : ''}{data?.rateOfChange || '0.0'}
        </div>
      </motion.div>

      {/* Min Weight: Consistent sizing with other cards */}
      <motion.div className="bg-white p-8 rounded-[3rem] shadow-sm border border-zinc-200/50 flex items-center justify-between group min-h-[160px]">
        <div className="flex flex-col whitespace-nowrap">
          <p className="font-black text-lg text-zinc-400 tracking-tight leading-none">Min</p>
          <p className="font-black text-lg text-zinc-900 tracking-tight leading-none mt-1">Weight</p>
        </div>
        <div className="flex-shrink-0 px-6 py-4 rounded-[2rem] text-zinc-900 font-black text-3xl  transition-transform group-hover:-translate-y-1">
          {data?.minWeight || '0.0'} <span className=' text-zinc-300 text-lg ml-1'>kg</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-zinc-100/50 h-40 rounded-[3rem] border border-zinc-100" />
      ))}
    </div>
  );
}

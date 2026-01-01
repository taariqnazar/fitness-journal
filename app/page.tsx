"use client"
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Plus } from "lucide-react"; // npm install lucide-react
import { motion, AnimatePresence } from 'framer-motion';

interface FitnessData {
  date: string;
  weight: number;
}

export default function Home() {
  const [data, setData] = useState<FitnessData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch('/api/users/1'); // Replace '1' with actual ID logic
      const result = await response.json();

      if (result.entries) {
        setData(result.entries);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading Metrics...</div>;

  const calculateReductionRate = (data: FitnessData[]) => {
    if (data.length < 2) return 0;
    const first = data[0].weight;
    const last = data[data.length - 1].weight;
    const weeks = data.length - 1;
    return ((first - last) / weeks).toFixed(1);
  };

  const currentWeight = data[data.length - 1].weight;
  const reductionRate = calculateReductionRate(data);
  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] py-20 px-6 font-sans selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto">

        {/* Header with Integrated Action */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 px-4 gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black text-zinc-900 tracking-tighter"
            >
              Fitness Tracker
            </motion.h1>
            <p className="text-zinc-400 text-lg font-medium mt-2">Personal Health Insights</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-full font-bold shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            Add New Entry
          </motion.button>
        </header>

        {/* Top Section: Bento Grid */}
        <div className="grid grid-cols-12 gap-10 mb-10">

          {/* Main Chart: Professional Modular Style */}
          <motion.div
            className="col-span-12 lg:col-span-8 bg-white p-12 rounded-[3.5rem] shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-zinc-200/50"
          >
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Weight Trend</h3>
                <p className="text-zinc-400 font-bold text-sm mt-1 uppercase tracking-widest">Last 6 Weeks</p>
              </div>
            </div>

            <div className="h-80 w-full -ml-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F1F4" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#D1D1D6', fontSize: 13, fontWeight: 700 }}
                    dy={25}
                  />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', padding: '20px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#6366f1"
                    strokeWidth={5}
                    fillOpacity={1}
                    fill="url(#chartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Sidebar Metrics */}
          <div className="col-span-12 lg:col-span-4 grid gap-10">
            <motion.div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-zinc-200/50 flex flex-col justify-between">
              <span className="text-zinc-400 text-xs font-black uppercase tracking-[0.2em]">Weight Status</span>
              <div className="mt-6">
                <span className="text-7xl font-black text-zinc-900 leading-none tracking-tighter">{currentWeight}</span>
                <span className="text-2xl font-black text-zinc-300 ml-3">kg</span>
              </div>
              <div className="mt-10 h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[70%] rounded-full" />
              </div>
            </motion.div>

            <motion.div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-zinc-200/50">
              <span className="text-zinc-400 text-xs font-black uppercase tracking-[0.2em]">Weekly Change</span>
              <div className="flex items-center gap-6 mt-8">
                <div className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-[2rem] font-black text-3xl">
                  -{reductionRate}
                </div>
                <div>
                  <p className="font-black text-xl text-zinc-900 tracking-tight leading-tight">Great<br />Progress</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section: Entries Table */}
        <motion.div
          className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-zinc-200/50"
        >
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Entry History</h3>
            <button className="text-zinc-400 font-bold text-sm hover:text-zinc-900 transition-colors">Export CSV</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-400 text-xs font-black uppercase tracking-[0.15em]">
                  <th className="pb-6 px-4">Date</th>
                  <th className="pb-6 px-4">Weight</th>
                  <th className="pb-6 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {data.map((entry, i) => (
                  <tr key={i} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="py-5 px-4 font-bold text-zinc-600">{entry.date}</td>
                    <td className="py-5 px-4 font-black text-zinc-900">{entry.weight} kg</td>
                    <td className="py-5 px-4 text-right">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

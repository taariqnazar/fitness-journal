'use client'
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import HabitCheckButton from '../components/HabitCheckButton';
import HabitCalendar from '../components/HabitCalendar';

export default function HabitsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['habit-data'],
    queryFn: () => fetch('/api/habits').then(res => res.json())
  });

  if (isLoading) return <div className="p-20 text-center font-black text-zinc-300">Loading Consistency...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-10 px-6">
      {/* Top Section: Action & Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white p-12 rounded-[3.5rem] border border-zinc-200/50 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-sm"
        >
          <div className="text-center sm:text-left">
            <h1 className="text-7xl font-black text-zinc-900 tracking-tighter italic leading-none">Habit</h1>
            <p className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] mt-4">Consistency is the only metric</p>
          </div>
          <HabitCheckButton className="flex-shrink-0" />
        </motion.div>
      </div>

      {/* The Custom Monthly Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <HabitCalendar logs={data?.logs || []} />
      </motion.div>
    </div>
  );
}

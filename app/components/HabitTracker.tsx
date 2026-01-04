'use client'
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  format,
  subWeeks,
  eachDayOfInterval,
  startOfToday,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  startOfMonth,
  addDays
} from 'date-fns';
import { Check, Flame } from 'lucide-react';

export default function HabitTracker() {
  const queryClient = useQueryClient();
  const today = startOfToday();
  const todayStr = format(today, 'yyyy-MM-dd');

  const { data } = useQuery({
    queryKey: ['habit-data'],
    queryFn: () => fetch('/api/habits').then(res => res.json())
  });

  const mutation = useMutation({
    mutationFn: () => fetch('/api/habits', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habit-data'] })
  });

  const isDoneToday = data?.logs?.some((l: any) => l.dateString === todayStr);

  // Generate the last 15 weeks of data grouped by week
  const weeks = Array.from({ length: 15 }).map((_, i) => {
    const startOfThatWeek = startOfWeek(subWeeks(today, 14 - i), { weekStartsOn: 1 });
    const endOfThatWeek = endOfWeek(startOfThatWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startOfThatWeek, end: endOfThatWeek });
  });

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Check-in Card */}
        <div className="md:col-span-2 bg-white p-10 rounded-[3.5rem] border border-zinc-200/50 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-4xl font-black text-zinc-900 tracking-tighter italic">Daily Habit</h2>
            <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-1">Consistency is key</p>
          </div>
          <button
            onClick={() => !isDoneToday && mutation.mutate()}
            className={`px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg ${isDoneToday ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white hover:scale-105 active:scale-95'
              }`}
          >
            {isDoneToday ? <span className="flex items-center gap-2"><Check size={18} strokeWidth={4} /> Done</span> : "Check In"}
          </button>
        </div>

        {/* Streak Card */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-zinc-200/50 relative overflow-hidden shadow-sm">
          <Flame className="absolute -right-4 -bottom-4 text-orange-50/50" size={120} />
          <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest relative z-10">Streak</span>
          <div className="mt-4 flex items-baseline gap-2 relative z-10">
            <span className="text-7xl font-black text-orange-500 italic tracking-tighter">{data?.streak || 0}</span>
            <span className="text-xl font-black text-zinc-300">Days</span>
          </div>
        </div>
      </div>

      {/* Consistency Heatmap - Refined for "Reddit" style layout */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-200/50 shadow-sm overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="flex gap-4">
            {/* Day Labels (M, W, F, S) */}
            <div className="flex flex-col justify-between text-[10px] font-black text-zinc-300 pt-6 pb-2">
              <span>M</span><span>W</span><span>F</span><span>S</span>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1.5 flex-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1.5">
                  {/* Month Label Logic */}
                  <div className="h-5 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                    {(weekIdx === 0 || !isSameMonth(week[0], weeks[weekIdx - 1][0])) && (
                      format(week[0], 'MMM')
                    )}
                  </div>

                  {/* The Week Column */}
                  {week.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const active = data?.logs?.some((l: any) => l.dateString === dateStr);
                    return (
                      <motion.div
                        key={dateStr}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`w-5 h-5 rounded-[4px] transition-all border ${active
                          ? 'bg-indigo-500 border-indigo-600 shadow-sm'
                          : 'bg-zinc-50 border-zinc-100'
                          }`}
                        title={dateStr}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

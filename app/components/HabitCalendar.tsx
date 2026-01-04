'use client'
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, addMonths, subMonths, isToday
} from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, Loader2 } from 'lucide-react';

export default function HabitCalendar() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 1. Fetching Logic: Refetches whenever currentMonth changes
  const { data, isLoading } = useQuery({
    queryKey: ['habit-data', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const res = await fetch(`/api/habits?month=${format(currentMonth, 'yyyy-MM')}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  // 2. Toggle Mutation
  const toggleMutation = useMutation({
    mutationFn: async (dateString: string) => {
      return fetch('/api/habits', {
        method: 'POST',
        body: JSON.stringify({ dateString }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-data'] });
    }
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="bg-white p-10 md:p-16 rounded-[4rem] border border-zinc-200/50 shadow-sm text-zinc-900 w-full mb-20 relative overflow-hidden">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
        <div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic leading-none">
            {format(monthStart, 'MMMM yyyy')}
          </h2>
          {/* Integrated Streak Display */}
          <div className="flex items-center gap-2 mt-4 text-orange-500">
            <Flame size={20} fill="currentColor" />
            <span className="font-black text-xl italic tracking-tighter">
              {data?.streak || 0} Day Streak
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoading && <Loader2 className="animate-spin text-zinc-300" size={24} />}
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-4 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-all text-zinc-400"
            >
              <ChevronLeft size={28} strokeWidth={3} />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-4 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-all text-zinc-400"
            >
              <ChevronRight size={28} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Unified Grid */}
      <div className="w-full">
        {/* Day Column Headers */}
        <div className="grid grid-cols-[minmax(60px,1fr)_repeat(7,2fr)] gap-4 md:gap-6 mb-8 items-center">
          <div />
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
            <span key={day} className="text-[10px] md:text-xs font-black text-zinc-400 uppercase tracking-[0.2em] text-center">
              {day}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-4 md:gap-6">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-[minmax(60px,1fr)_repeat(7,2fr)] gap-4 md:gap-6 items-center">

              <div className="flex items-center">
                <span className="text-[10px] md:text-xs font-black text-zinc-300 uppercase tracking-widest whitespace-nowrap">
                  {format(week[0], 'MMM dd')}
                </span>
              </div>

              {week.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isLogged = data?.logs?.some((l: any) => l.dateString === dateStr);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const today = isToday(day);

                return (
                  <motion.button
                    key={dateStr}
                    onClick={() => isCurrentMonth && toggleMutation.mutate(dateStr)}
                    disabled={!isCurrentMonth || toggleMutation.isPending}
                    whileHover={isCurrentMonth ? { scale: 1.05 } : {}}
                    whileTap={isCurrentMonth ? { scale: 0.95 } : {}}
                    className={`aspect-square w-full rounded-lg md:rounded-[1.5rem] transition-all border relative flex items-center justify-center group ${isLogged
                        ? 'bg-zinc-900 border-zinc-900 shadow-xl shadow-zinc-200'
                        : today
                          ? 'bg-white border-zinc-900 border-2'
                          : 'bg-zinc-100 border-zinc-100'
                      } ${!isCurrentMonth ? 'opacity-10 cursor-default' : 'cursor-pointer'}`}
                  >
                    {/* Visual indicator for "Today" if not logged */}
                    {today && !isLogged && (
                      <div className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

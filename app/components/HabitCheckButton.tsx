'use client'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { format, startOfToday } from 'date-fns';

export default function HabitCheckButton({ className = "" }: { className?: string }) {
  const queryClient = useQueryClient();
  const todayStr = format(startOfToday(), 'yyyy-MM-dd');

  const { data } = useQuery({
    queryKey: ['habit-data'],
    queryFn: () => fetch('/api/habits').then(res => res.json())
  });

  const mutation = useMutation({
    mutationFn: () => fetch('/api/habits', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habit-data'] })
  });

  const isDoneToday = data?.logs?.some((l: any) => l.dateString === todayStr);

  return (
    <button
      onClick={() => !isDoneToday && mutation.mutate()}
      disabled={isDoneToday || mutation.isPending}
      className={`relative flex items-center justify-center gap-3 px-10 py-6 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:active:scale-100 ${isDoneToday
          ? 'bg-[#4ADE80] text-white shadow-emerald-100 cursor-default'
          : 'bg-zinc-900 text-white shadow-zinc-200 hover:scale-105'
        } ${className}`}
    >
      {mutation.isPending ? (
        <Loader2 className="animate-spin" size={18} />
      ) : isDoneToday ? (
        <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
          <Check size={18} strokeWidth={4} /> Done
        </motion.span>
      ) : (
        "Mark Today"
      )}
    </button>
  );
}

'use client'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader } from 'lucide-react';
import { format, startOfToday } from 'date-fns';

export default function HabitCheckButton({ className = "" }: { className?: string }) {
  const queryClient = useQueryClient();
  const todayStr = format(startOfToday(), 'yyyy-MM-dd');

  const { data } = useQuery({
    queryKey: ['habit-data'],
    queryFn: () => fetch('/api/habits').then(res => res.json())
  });

  const mutation = useMutation({
    mutationFn: async (dateString: string) => {
      // Artificial delay to appreciate the animation (optional)
      // await new Promise(resolve => setTimeout(resolve, 1000));
      return fetch('/api/habits', {
        method: 'POST',
        body: JSON.stringify({ dateString }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-data'] });
    }
  });

  const isDoneToday = data?.logs?.some((l: any) => l.dateString === todayStr);

  return (
    <motion.button
      layout // Smoothly animates the button's width/height changes
      onClick={() => mutation.mutate(todayStr)}
      disabled={mutation.isPending}
      className={`relative flex items-center justify-center gap-3 px-8 py-5 rounded-[2.2rem] font-black text-md uppercase tracking-[0.1em] transition-colors shadow-xl active:scale-95 disabled:active:scale-100 ${isDoneToday
        ? 'bg-[#4ADE80] text-white shadow-emerald-100 cursor-default'
        : 'bg-zinc-900 text-white shadow-zinc-200 hover:scale-105'
        } ${className}`}
    >
      <AnimatePresence mode="wait">
        {mutation.isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Loader className="animate-spin" size={18} />
          </motion.div>
        ) : isDoneToday ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Check size={18} strokeWidth={4} /> Done
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Mark Today
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

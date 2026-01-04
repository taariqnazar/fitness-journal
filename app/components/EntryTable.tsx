'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, RotateCcw, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function EntryTable() {
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const limit = 10;

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['table-entries', page],
    queryFn: async () => {
      const res = await fetch(`/api/entries?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-entries'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setDeletingId(null);
    }
  });

  const entries = data?.history || [];
  const pagination = data?.pagination;

  if (isLoading && !data) {
    return (
      <div className="bg-white p-12 rounded-[3.5rem] border border-zinc-200/50 flex justify-center">
        <Loader2 className="animate-spin text-zinc-300" size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-zinc-200/50"
    >
      <div className="flex justify-between items-center mb-10 px-4">
        <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Entry History</h3>
      </div>

      <div className={`overflow-x-auto transition-all duration-300 ${isPlaceholderData ? 'opacity-40 grayscale' : 'opacity-100'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-zinc-300 text-xs font-black uppercase tracking-[0.2em]">
              <th className="pb-8 px-4 border-b border-zinc-50">Date</th>
              <th className="pb-8 px-4 border-b border-zinc-50">Weight</th>
              <th className="pb-8 px-4 border-b border-zinc-50 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {entries.map((entry: any) => (
              <tr key={entry.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-6 px-4 font-bold text-zinc-500">
                  {format(new Date(entry.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="py-6 px-4 font-black text-zinc-900 text-xl tracking-tight">
                  {entry.weight} <span className="text-zinc-300 text-sm ml-1">kg</span>
                </td>
                <td className="py-6 px-4 text-right w-50">
                  <AnimatePresence mode="wait">
                    {deletingId === entry.id ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="inline-flex items-center gap-2 bg-zinc-100 p-1 rounded-full border border-zinc-200"
                      >
                        <button
                          onClick={() => deleteMutation.mutate(entry.id)}
                          className="p-2 text-emerald-600 hover:bg-white rounded-full transition-all"
                        >
                          {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} strokeWidth={3} />}
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="p-2 text-red-500 hover:bg-white rounded-full transition-all"
                        >
                          <RotateCcw size={16} strokeWidth={3} />
                        </button>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(entry.id)}
                        className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-3 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={18} strokeWidth={3} />
          </button>

          <div className="flex gap-1 px-2">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-full text-[10px] font-black transition-all ${page === i + 1
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-400 hover:bg-zinc-50'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="p-3 bg-zinc-50 text-zinc-400 rounded-full hover:bg-zinc-100 disabled:opacity-20 transition-all"
          >
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

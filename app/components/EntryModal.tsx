'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEntryStore } from '../store/useEntryStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';

export default function EntryModal() {
  const { isEntryModalOpen, closeEntryModal } = useEntryStore();
  const [isBulk, setIsBulk] = useState(false);
  const [singleWeight, setSingleWeight] = useState('');
  const [bulkText, setBulkText] = useState('');
  const queryClient = useQueryClient();

  // Derived state for validation
  const isValidJson = (() => {
    if (!bulkText.trim()) return false;
    try {
      const json = JSON.parse(bulkText);
      return Array.isArray(json) && json.length > 0;
    } catch {
      return false;
    }
  })();

  const parseBulkData = (text: string) => {
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        return json.map(item => ({
          date: new Date(item.date),
          weight: parseFloat(item.weight)
        })).filter(item => !isNaN(item.weight));
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/entries/bulk', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      setSingleWeight('');
      setBulkText('');
      closeEntryModal();
      setIsBulk(false);
    },
  });

  // Determine if we can submit
  const canSubmit = isBulk ? isValidJson : singleWeight.length > 0;

  return (
    <AnimatePresence>
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/60 text-zinc-900 backdrop-blur-sm">
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0" onClick={closeEntryModal} />

          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-[480px] rounded-[3.5rem] p-12 shadow-2xl relative z-10"
          >
            {/* Close Button */}
            <button onClick={closeEntryModal} className="absolute top-10 right-10 text-zinc-300 hover:text-zinc-900 transition-colors">
              <X size={24} strokeWidth={3} />
            </button>

            <h2 className="text-4xl font-black text-zinc-900 tracking-tighter mb-2">
              {isBulk ? 'Bulk Import' : 'New Entry'}
            </h2>
            <p className="text-zinc-400 font-medium text-lg">
              {isBulk ? 'Import weight history via JSON.' : 'Log your weight for today.'}
            </p>

            {isBulk ? (
              /* Bulk Mode View */
              <div className="flex flex-col gap-4 mt-8 mb-6">
                <div className="flex justify-between items-center px-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">JSON Array</span>
                  {bulkText && (
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${isValidJson ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {isValidJson ? '✓ Valid' : '✕ Invalid'}
                    </span>
                  )}
                </div>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder='[{"date": "2025-12-01", "weight": 101.4}, ...]'
                  className="w-full h-64 p-8 bg-zinc-50 border-2 border-zinc-100 rounded-[2.5rem] font-mono text-xs leading-relaxed outline-none focus:ring-4 ring-indigo-500/10 transition-all resize-none"
                />
              </div>
            ) : (
              /* Single Entry View */
              <div className="relative my-12">
                <input
                  type="decimal"
                  step="0.1"
                  autoFocus
                  value={singleWeight}
                  onChange={(e) => setSingleWeight(e.target.value)}
                  placeholder="Current Weight"
                  className="w-full p-10 bg-zinc-50 border-none rounded-[2.5rem] font-black text-4xl outline-none text-center focus:ring-4 ring-indigo-500/10 transition-all"
                />
                <span className="absolute right-20 top-1/2 -translate-y-1/2 font-black text-zinc-400 text-2xl uppercase">kg</span>
              </div>
            )}

            <button
              disabled={!canSubmit || mutation.isPending}
              onClick={() => isBulk ? mutation.mutate({ data: parseBulkData(bulkText) }) : mutation.mutate({ weight: singleWeight })}
              className={`w-full py-6 rounded-full font-black text-lg shadow-xl transition-all flex justify-center items-center ${canSubmit && !mutation.isPending
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 text-zinc-300 cursor-not-allowed shadow-none'
                }`}
            >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Save Entries'}
            </button>

            <button
              onClick={() => setIsBulk(!isBulk)}
              className="w-full mt-6 text-zinc-400 font-bold text-sm hover:text-zinc-900 transition-colors"
            >
              {isBulk ? 'Switch to Single Entry' : 'Or bulk add from a list'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

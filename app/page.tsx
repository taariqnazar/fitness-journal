'use client'
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from './store/useAuthStore';
import { useFitnessData } from './hooks/useFitnessData';

import Header from './components/Header';
import EntryTable from './components/EntryTable';
import WeightChart from './components/WeightChart';
import Metrics from './components/Metrics';

export default function Home() {
  const { status } = useSession();
  const openModal = useAuthStore((state) => state.openModal);
  const { data, isLoading } = useFitnessData();

  useEffect(() => {
    if (status === 'unauthenticated') {
      openModal('login'); // Automatically prompt if not logged in
    }
  }, [status, openModal]);

  if (isLoading || status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center font-black text-zinc-300">LOADING METRICS...</div>;
  }

  return (
    <div className="w-full min-h-screen py-20 px-6 font-sans selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <Header />
        <Metrics />
        <WeightChart />
      </div>
    </div>
  );
}

import WeightChart from './WeightChart';

export default function StatsGrid({ currentWeight, reductionRate }: any) {
  return (
    <div className="grid grid-cols-12 gap-10 mb-10">
      {/* Chart */}
      <WeightChart />

      {/* Sidebar Cards */}
      <div className="col-span-12 lg:col-span-4 grid gap-10">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-zinc-200/50">
          <span className="text-zinc-400 text-xs font-black uppercase tracking-widest">Weight Status</span>
          <div className="mt-6">
            <span className="text-7xl font-black text-zinc-900 leading-none tracking-tighter">{currentWeight}</span>
            <span className="text-2xl font-black text-zinc-300 ml-3">kg</span>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-zinc-200/50 flex items-center gap-6">
          <div className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-[2rem] font-black text-3xl">
            {reductionRate}
          </div>
          <p className="font-black text-xl text-zinc-900 tracking-tight leading-tight">Rate of <br />Change</p>
        </div>
      </div>
    </div>
  );
}

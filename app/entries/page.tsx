import EntryTable from '../components/EntryTable';

export default function EntriesPage() {
  return (
    <div className="w-full min-h-screen bg-[#F8F9FA] py-20 px-6 font-sans selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto space-y-8">
        <EntryTable />
      </div>
    </div>
  );
}

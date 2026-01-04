'use client'
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function RegisterSteps() {
  const { view, setView, formData, updateFormData, closeModal } = useAuthStore();

  const handleRegister = async () => {
    // 1. Call your /api/register endpoint
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      // 2. Automatically sign in after successful registration
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });
      closeModal();
    }
  };

  return (
    <div className="w-full">
      {view === 'register-1' && (
        <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">The Basics</h2>
          <p className="text-zinc-400 font-medium mb-10 text-lg">Create your account to start.</p>

          <div className="space-y-4 mb-10">
            <input
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="Email address"
              className="w-full p-6 bg-zinc-50 dark:bg-zinc-800 border-none rounded-[2rem] font-bold outline-none"
            />
            <input
              type="password"
              onChange={(e) => updateFormData({ password: e.target.value })}
              placeholder="Create Password"
              className="w-full p-6 bg-zinc-50 dark:bg-zinc-800 border-none rounded-[2rem] font-bold outline-none"
            />
          </div>

          <button
            onClick={() => setView('register-2')}
            className="w-full py-6 bg-indigo-600 text-white rounded-full font-black text-lg flex items-center justify-center gap-2"
          >
            Next Step <ArrowRight size={20} strokeWidth={3} />
          </button>
        </motion.div>
      )}

      {view === 'register-2' && (
        <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <button onClick={() => setView('register-1')} className="flex items-center gap-2 text-zinc-400 font-bold text-sm mb-6 hover:text-zinc-900 transition-colors">
            <ArrowLeft size={16} strokeWidth={3} /> Back
          </button>

          <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">Almost there</h2>
          <p className="text-zinc-400 font-medium mb-10 text-lg">Your initial profile data.</p>

          <div className="space-y-4 mb-10">
            <div className="flex gap-4">
              <input
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                placeholder="First Name"
                className="w-1/2 p-6 bg-zinc-50 dark:bg-zinc-800 border-none rounded-[2rem] font-bold outline-none"
              />
              <input
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                placeholder="Last Name"
                className="w-1/2 p-6 bg-zinc-50 dark:bg-zinc-800 border-none rounded-[2rem] font-bold outline-none"
              />
            </div>
            <div className="relative">
              <input
                onChange={(e) => updateFormData({ weight: parseFloat(e.target.value) })}
                placeholder="Current Weight"
                className="w-full p-6 bg-zinc-50 dark:bg-zinc-800 border-none rounded-[2rem] font-bold outline-none"
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-zinc-300">kg</span>
            </div>
          </div>

          <button
            onClick={handleRegister}
            className="w-full py-6 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-full font-black text-lg shadow-xl"
          >
            Finish Setup
          </button>
        </motion.div>
      )}
    </div>
  );
}

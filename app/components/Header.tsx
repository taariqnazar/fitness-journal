'use client'

import { motion } from 'framer-motion'
import { Plus, User as UserIcon, LogOut } from "lucide-react"
import { useEntryStore } from '../store/useEntryStore'
import { useSession, signOut } from 'next-auth/react'
import { useUser } from '../hooks/useUser'
import HabitCheckButton from './HabitCheckButton'

export default function Header() {
  const openEntryModal = useEntryStore((state) => state.openEntryModal) // Trigger from Zustand
  const { data: user } = useUser()

  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-16 px-4 gap-8">
      {/* Brand & User Greeting */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter leading-none">
            Fitness Tracker
          </h1>
          <div className="flex items-center gap mt-3">
            <p className="text-zinc-400 text-lg font-medium">
              Welcome back, <span className="text-zinc-900 font-bold">{user?.firstName || 'Athlete'}</span>
            </p>
            {/* Sign Out Button - Ghost Style */}
            <button
              onClick={() => signOut()}
              className="p-4 text-zinc-300 hover:text-red-500 transition-colors duration-200"
              title="Sign Out"
            >
              <LogOut size={22} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Action Group */}
      <div className="flex items-center gap-4">

        {/* The "Twisty" Plus Button */}
        <motion.button
          onClick={openEntryModal}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-full font-black text-lg shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all border border-zinc-800"
        >
          <Plus size={22} strokeWidth={4} />
          Add Entry
        </motion.button>

        <HabitCheckButton />
      </div>
    </header>
  )
}

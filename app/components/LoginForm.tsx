'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { Loader2 } from 'lucide-react'

export default function LoginForm() {
  const { setView, closeModal } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Using Auth.js Credentials provider
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false, // Prevents page reload so we can handle errors manually
    })

    if (result?.error) {
      setError('Invalid email or password')
      setIsLoading(false)
    } else {
      closeModal()
      // Optional: window.location.reload() to refresh TanStack Query data
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full"
    >
      <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">
        Welcome back
      </h2>
      <p className="text-zinc-400 font-medium mb-10 text-lg">
        Sign in to your weight journal.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full p-6 bg-zinc-50 dark:bg-zinc-800 border-none rounded-[2rem] font-bold outline-none focus:ring-2 ring-indigo-500/20 transition-all"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-6 bg-zinc-50 dark:bg-zinc-800 border-none rounded-[2rem] font-bold outline-none focus:ring-2 ring-indigo-500/20 transition-all"
          />
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="w-full py-6 mt-6 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-full font-black text-lg shadow-xl shadow-zinc-200 dark:shadow-none hover:bg-zinc-800 transition-all flex justify-center items-center"
        >
          {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => setView('register-1')}
          className="text-zinc-400 font-bold text-sm hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          New here? <span className="text-indigo-600">Create an account</span>
        </button>
      </div>
    </motion.div>
  )
}

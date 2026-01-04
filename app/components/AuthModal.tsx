'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterSteps from './RegisterSteps';

export default function AuthModal() {
  const { isOpen, view, closeModal } = useAuthStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-sm">
          {/* Overlay Click to Close */}
          <div className="absolute inset-0" onClick={closeModal} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-[500px] rounded-[3.5rem] p-12 shadow-2xl relative z-10 overflow-hidden"
          >
            <button
              onClick={closeModal}
              className="absolute top-10 right-10 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="min-h-[450px] flex flex-col justify-center">
              {view === 'login' ? <LoginForm /> : <RegisterSteps />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

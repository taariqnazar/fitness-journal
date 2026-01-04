'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, ListOrdered, Calendar } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/entries', label: 'Entries', icon: ListOrdered },
  { href: '/habits', label: 'Habits', icon: Calendar },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl z-50">
      <ul className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link href={item.href} className="relative px-6 py-3 flex items-center gap-2 group">
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={18} className={`relative z-10 transition-colors ${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-white'}`} />
                <span className={`relative z-10 text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-white'}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Briefcase, LogOut, LayoutDashboard, PlusCircle, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f1a]/85 backdrop-blur-md border-b border-[#2d2d4e] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg shadow-glow transition-transform group-hover:scale-105">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent tracking-wide">
              JobAgent
            </span>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <Link
              href="/jobs/new"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/jobs/new'
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Job</span>
            </Link>

            <div className="h-6 w-px bg-[#2d2d4e] mx-1 sm:mx-2" />

            {/* Profile & Logout */}
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block text-xs text-gray-400 font-medium">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

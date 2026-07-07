'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, KeyRound, Mail, User, AlertCircle, Sparkles } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Registration failed');
      }

      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#1a1a2e]/60 backdrop-blur-xl border border-[#2d2d4e] p-8 rounded-2xl shadow-glow">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl shadow-glow mb-4">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create your account
          </h2>
          <p className="mt-2 text-xs text-gray-400">
            Sign up to get a unified dashboard for all your job applications.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/20 border border-rose-500/25 text-rose-400 rounded-lg text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-655 outline-none transition-colors"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-655 outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-500" />
              <input
                type="password"
                required
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-655 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-glow disabled:opacity-50 transition-all hover:scale-[1.01]"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Registering...' : 'Sign Up'}</span>
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline transition-colors">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import JobInputForm from '@/components/JobInputForm';
import { ChevronLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NewJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-2 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5.5 h-5.5 text-indigo-400" />
            <span>Add New Job posting</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Analyze a job description using Gemini AI, extract required skills, and add it to your tracking board.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <JobInputForm />
    </div>
  );
}

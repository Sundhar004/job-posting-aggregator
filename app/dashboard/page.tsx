'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { IJobPosting, JobStatus } from '@/types';
import KanbanBoard from '@/components/KanbanBoard';
import FilterBar from '@/components/FilterBar';
import SkillsEditor from '@/components/SkillsEditor';
import NotesModal from '@/components/NotesModal';
import JobDetailModal from '@/components/JobDetailModal';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  // Data State
  const [jobs, setJobs] = useState<IJobPosting[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Filter State
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [skill, setSkill] = useState('');

  // Modals & UI helpers
  const [selectedJobForNotes, setSelectedJobForNotes] = useState<IJobPosting | null>(null);
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<IJobPosting | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Check auth
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  // Fetch Jobs list
  const fetchJobs = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (workMode) q.append('workMode', workMode);
      if (skill) q.append('skill', skill);

      const res = await fetch(`/api/jobs?${q.toString()}`, {
        credentials: 'same-origin',
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  }, [search, workMode, skill]);

  // Fetch user profile (skills)
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const data = await res.json();
        setSkills(data.user?.skills || []);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, []);

  // Sync data on load and query updates
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchJobs();
    }
  }, [authStatus, fetchJobs]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchProfile();
    }
  }, [authStatus, fetchProfile]);

  // Update job status (Kanban drop / select change)
  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    // Optimistic Update
    const originalJobs = [...jobs];
    setJobs((prev) =>
      prev.map((job) => (job._id === jobId ? { ...job, status: newStatus } : job))
    );

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      // Revert if error
      setJobs(originalJobs);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return;
    }

    // Optimistic Update
    const originalJobs = [...jobs];
    setJobs((prev) => prev.filter((job) => job._id !== jobId));

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete job');
      }
    } catch (err) {
      console.error(err);
      // Revert if error
      setJobs(originalJobs);
    }
  };

  // Update job notes
  const handleSaveNotes = async (jobId: string, notesContent: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesContent }),
      });

      if (res.ok) {
        // Sync in list
        setJobs((prev) =>
          prev.map((job) => (job._id === jobId ? { ...job, notes: notesContent } : job))
        );
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  // Update profile skills
  const handleSaveProfileSkills = async (updatedSkills: string[]) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: updatedSkills }),
      });

      if (res.ok) {
        setSkills(updatedSkills);
        // Refresh jobs lists to show new match rates
        fetchJobs();
      }
    } catch (err) {
      console.error('Error updating skills:', err);
    }
  };

  // Save job details from detail modal
  const handleSaveJobDetails = async (jobId: string, updates: Partial<IJobPosting>) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        // Update local state
        setJobs((prev) =>
          prev.map((job) =>
            job._id === jobId
              ? { ...job, ...updates }
              : job
          )
        );
      }
    } catch (err) {
      console.error('Error saving job details:', err);
    }
  };

  // CSV Export Trigger
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      window.location.href = '/api/export';
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setWorkMode('');
    setSkill('');
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Hello, {session.user?.name}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track and organize all your job postings and applications here.
          </p>
        </div>
      </div>

      {/* Main Grid: Filters, Profile Skills side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Filters & Kanban Board */}
        <div className="lg:col-span-2 space-y-6">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            workMode={workMode}
            onWorkModeChange={setWorkMode}
            skill={skill}
            onSkillChange={setSkill}
            onReset={handleResetFilters}
            onExport={handleExportCSV}
            isExporting={isExporting}
          />
        </div>

        {/* Right 1 Col: Skill Set Editor */}
        <div>
          <SkillsEditor initialSkills={skills} onSave={handleSaveProfileSkills} />
        </div>
      </div>

      {/* Kanban Board Row */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Application Board</h2>
        {loadingJobs ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <KanbanBoard
            jobs={jobs}
            onStatusChange={handleStatusChange}
            onOpenNotes={setSelectedJobForNotes}
            onDelete={handleDeleteJob}
            onOpenDetail={setSelectedJobForDetail}
          />
        )}
      </div>

      {/* Notes Modal */}
      <NotesModal
        isOpen={!!selectedJobForNotes}
        job={selectedJobForNotes}
        onClose={() => setSelectedJobForNotes(null)}
        onSave={handleSaveNotes}
      />

      {/* Job Detail Modal */}
      <JobDetailModal
        isOpen={!!selectedJobForDetail}
        job={selectedJobForDetail}
        onClose={() => setSelectedJobForDetail(null)}
        onSave={handleSaveJobDetails}
      />
    </div>
  );
}

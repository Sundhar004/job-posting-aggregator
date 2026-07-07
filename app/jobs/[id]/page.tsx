'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { IJobPosting, IApplication, JobStatus, WorkMode } from '@/types';
import DeadlineBadge from '@/components/DeadlineBadge';
import SkillMatchBadge from '@/components/SkillMatchBadge';
import {
  ChevronLeft,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Award,
  Trash2,
  FileText,
  Clock,
  ExternalLink,
  Save,
  CheckCircle,
} from 'lucide-react';

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  // State
  const [job, setJob] = useState<IJobPosting | null>(null);
  const [history, setHistory] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit fields state
  const [isEditing, setIsEditing] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('unknown');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [jdSummary, setJdSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<JobStatus>('Saved');
  const [saving, setSaving] = useState(false);

  // Check auth
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  // Fetch job details
  useEffect(() => {
    async function loadData() {
      if (authStatus !== 'authenticated') return;
      try {
        const res = await fetch(`/api/jobs/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to load job posting detail');
        }
        const data = await res.json();
        setJob(data.job);
        setHistory(data.history || []);

        // Prepopulate edit inputs
        if (data.job) {
          setJobTitle(data.job.jobTitle);
          setCompanyName(data.job.companyName);
          setLocation(data.job.location || '');
          setWorkMode(data.job.workMode);
          setExperienceRequired(data.job.experienceRequired || '');
          setSalaryRange(data.job.salaryRange || '');
          setJdSummary(data.job.jdSummary || '');
          setNotes(data.job.notes || '');
          setStatus(data.job.status);
          if (data.job.applicationDeadline) {
            setApplicationDeadline(
              new Date(data.job.applicationDeadline).toISOString().split('T')[0]
            );
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id, authStatus]);

  // Update handler
  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          companyName,
          location: location || null,
          workMode,
          experienceRequired: experienceRequired || null,
          salaryRange: salaryRange || null,
          applicationDeadline: applicationDeadline || null,
          jdSummary,
          notes,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save updates');
      }

      const body = await res.json();
      setJob(body.job);
      setIsEditing(false);

      // Refresh status history logs
      const historyRes = await fetch(`/api/jobs/${params.id}`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.history || []);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job posting? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Failed to delete job posting');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12 max-w-md mx-auto space-y-4">
        <p className="text-red-400 font-semibold">{error || 'Job posting not found'}</p>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-indigo-400 font-bold hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const workModeLabels: Record<string, string> = {
    remote:  'Remote',
    hybrid:  'Hybrid',
    onsite:  'Onsite',
    unknown: 'Unknown',
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-6 shadow-card space-y-6">
        {/* Title Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#2d2d4e]">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{job.jobTitle}</h1>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 font-semibold">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>{job.companyName}</span>
              {job.sourceUrl && (
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 ml-1 transition-colors"
                >
                  <span className="text-xs">Original Post</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SkillMatchBadge percent={job.matchPercent} />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold px-3 py-1.5 bg-[#22223b] border border-indigo-900/30 text-gray-300 hover:text-white rounded hover:bg-[#2d2d4e] transition-colors"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-950/25 border border-red-500/20 text-red-400 hover:bg-red-650 hover:text-white rounded transition-colors"
              title="Delete Job"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Panel vs View Detail */}
        {isEditing ? (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Edit Job Posting</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Role Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Company</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                  className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-gray-300 outline-none"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Salary Range</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Experience Required</label>
                <input
                  type="text"
                  value={experienceRequired}
                  onChange={(e) => setExperienceRequired(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Application Deadline</label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Application Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JobStatus)}
                  className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-gray-350 outline-none"
                >
                  <option value="Saved">Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Job Summary</label>
              <textarea
                rows={3}
                value={jdSummary}
                onChange={(e) => setJdSummary(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-white outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Personal Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg text-sm text-white outline-none resize-none"
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-glow disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 columns: job information & summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
                  <MapPin className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-450 uppercase font-semibold">Location</span>
                    <span className="text-sm font-semibold text-white">{job.location || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
                  <Briefcase className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-450 uppercase font-semibold">Work Mode</span>
                    <span className="text-sm font-semibold text-white">{workModeLabels[job.workMode]}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
                  <Clock className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-455 uppercase font-semibold">Deadline</span>
                    <div className="mt-0.5">
                      <DeadlineBadge deadline={job.applicationDeadline} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
                  <DollarSign className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-455 uppercase font-semibold">Salary Range</span>
                    <span className="text-sm font-semibold text-white">{job.salaryRange || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
                  <Award className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-455 uppercase font-semibold">Experience</span>
                    <span className="text-sm font-semibold text-white">{job.experienceRequired || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-gray-455 uppercase font-semibold">Current Status</span>
                    <span className="text-sm font-semibold text-indigo-300">{job.status}</span>
                  </div>
                </div>
              </div>

              {/* JD Summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Job Posting Summary</h3>
                <div className="p-4 bg-[#131324] border border-[#2d2d4e] rounded-lg text-sm text-gray-300 leading-relaxed">
                  {job.jdSummary || 'No summary available.'}
                </div>
              </div>

              {/* Required Skills list */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.length === 0 ? (
                    <span className="text-xs text-gray-650 italic">No specific skills listed.</span>
                  ) : (
                    job.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="text-xs px-3 py-1.5 rounded-full bg-indigo-950/40 text-indigo-300 border border-indigo-500/20"
                      >
                        {sk}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Personal Notes */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-4 h-4 text-indigo-400" /> Personal Notes
                </h3>
                <div className="p-4 bg-[#131324] border border-[#2d2d4e] rounded-lg text-sm text-gray-300 whitespace-pre-wrap leading-relaxed min-h-24">
                  {job.notes || (
                    <span className="text-gray-500 italic">No notes added. Click edit to write custom notes.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: Status history audit timeline */}
            <div className="space-y-4 bg-[#131324] border border-[#2d2d4e] rounded-lg p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-4.5 h-4.5 text-indigo-400" />
                <span>Application History Log</span>
              </h3>

              {history.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No history logged yet.</p>
              ) : (
                <div className="relative pl-4 border-l border-[#2d2d4e] space-y-4">
                  {history.map((log) => (
                    <div key={log._id} className="relative space-y-1">
                      {/* Timeline dot */}
                      <span className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-[#131324]" />
                      <div className="text-xs font-semibold text-gray-300">
                        Status changed from <span className="text-indigo-400 font-bold">{log.fromStatus}</span> to{' '}
                        <span className="text-emerald-400 font-bold">{log.toStatus}</span>
                      </div>
                      <div className="text-[10px] text-gray-550 font-medium">
                        {new Date(log.changedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

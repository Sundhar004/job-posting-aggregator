'use client';

import { useState, useEffect } from 'react';
import { X, Building2, MapPin, Briefcase, Calendar, DollarSign, Award, FileText, ExternalLink, Save } from 'lucide-react';
import type { IJobPosting, JobStatus, WorkMode } from '@/types';
import DeadlineBadge from './DeadlineBadge';
import SkillMatchBadge from './SkillMatchBadge';

interface JobDetailModalProps {
  job: IJobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<IJobPosting>) => Promise<void>;
}

export default function JobDetailModal({ job, isOpen, onClose, onSave }: JobDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<JobStatus>('Saved');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (job) {
      setNotes(job.notes || '');
      setStatus(job.status);
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(job._id, { notes, status });
      onClose();
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setSaving(false);
    }
  };

  const workModeLabels: Record<string, string> = {
    remote: 'Remote',
    hybrid: 'Hybrid',
    onsite: 'Onsite',
    unknown: 'Unknown',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl shadow-glow-lg overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2d4e] sticky top-0 bg-[#1a1a2e] z-10">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">{job.jobTitle}</h2>
              <p className="text-xs text-gray-400">{job.companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Match % and Source URL */}
          <div className="flex items-center justify-between">
            <SkillMatchBadge percent={job.matchPercent} />
            {job.sourceUrl && (
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <span>Original Post</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Job Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Location</span>
                <span className="text-sm font-semibold text-white">{job.location || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Work Mode</span>
                <span className="text-sm font-semibold text-white">{workModeLabels[job.workMode]}</span>
              </div>
            </div>

            <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Deadline</span>
                <div className="mt-0.5">
                  <DeadlineBadge deadline={job.applicationDeadline} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Salary Range</span>
                <span className="text-sm font-semibold text-white">{job.salaryRange || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
              <Award className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Experience</span>
                <span className="text-sm font-semibold text-white">{job.experienceRequired || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#131324] border border-[#2d2d4e] rounded-lg flex items-center gap-3">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-semibold">Status</span>
                <span className="text-sm font-semibold text-indigo-300">{job.status}</span>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.length === 0 ? (
                <span className="text-xs text-gray-500 italic">No specific skills listed.</span>
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

          {/* JD Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Job Description Summary</h3>
            <div className="p-4 bg-[#131324] border border-[#2d2d4e] rounded-lg text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto">
              {job.jdSummary || 'No summary available.'}
            </div>
          </div>

          {/* Editable Notes */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-4 h-4 text-indigo-400" /> Personal Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about interviews, contact persons, application progress, or referral info..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-600 outline-none resize-none transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Update Status</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full px-4 py-2 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-gray-300 outline-none transition-colors"
            >
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2d2d4e] bg-[#131324]/50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#22223b] border border-indigo-900/30 hover:bg-[#2d2d4e] text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

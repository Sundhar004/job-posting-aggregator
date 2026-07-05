'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, FileText, Sparkles, AlertCircle, Save, CheckCircle, Plus, X } from 'lucide-react';
import type { ExtractedJob, JobStatus, WorkMode } from '@/types';

export default function JobInputForm() {
  const router = useRouter();

  // Mode: 'url' | 'text'
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted preview state
  const [preview, setPreview] = useState<ExtractedJob | null>(null);
  const [status, setStatus] = useState<JobStatus>('Saved');
  const [notes, setNotes] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  // Extraction Handler
  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mode === 'url' ? url : undefined,
          text: mode === 'text' ? rawText : undefined,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to extract job posting details');
      }

      setPreview(body.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Skill adjustments
  const handleAddSkill = () => {
    if (!preview) return;
    const clean = newSkill.trim();
    if (clean && !preview.requiredSkills.includes(clean)) {
      setPreview({
        ...preview,
        requiredSkills: [...preview.requiredSkills, clean],
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    if (!preview) return;
    setPreview({
      ...preview,
      requiredSkills: preview.requiredSkills.filter((s) => s !== skill),
    });
  };

  // Submit Handler
  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preview,
          sourceUrl: mode === 'url' ? url : undefined,
          rawText: mode === 'text' ? rawText : undefined,
          status,
          notes,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to save job posting');
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Selector Tabs */}
      <div className="flex bg-[#1a1a2e] border border-[#2d2d4e] p-1 rounded-xl w-fit">
        <button
          onClick={() => {
            setMode('url');
            setError(null);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'url'
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Scrape from Link</span>
        </button>
        <button
          onClick={() => {
            setMode('text');
            setError(null);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'text'
              ? 'bg-indigo-600 text-white shadow-glow'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Job Text</span>
        </button>
      </div>

      {/* Input panel */}
      {!preview && (
        <form
          onSubmit={handleExtract}
          className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-6 shadow-card space-y-4"
        >
          {mode === 'url' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Job Posting URL
              </label>
              <input
                type="url"
                required
                placeholder="https://linkedin.com/jobs/view/... or any job site"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Job Description Text
              </label>
              <textarea
                required
                rows={8}
                placeholder="Paste the full job posting contents here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-colors resize-none"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-bold shadow-glow disabled:opacity-50 transition-all hover:scale-[1.01]"
          >
            <Sparkles className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Job Posting with AI...' : 'Analyze & Extract'}</span>
          </button>
        </form>
      )}

      {/* Extracted Preview Panel */}
      {preview && (
        <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-6 shadow-card space-y-6 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2d2d4e]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-indigo-400" /> AI Extracted Data
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Please verify and edit the details below before saving.
              </p>
            </div>
            <button
              onClick={() => setPreview(null)}
              className="text-xs font-semibold px-3 py-1 bg-[#22223b] hover:bg-[#2d2d4e] border border-indigo-900/30 text-gray-300 hover:text-white rounded transition-colors"
            >
              Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Job Title</label>
              <input
                type="text"
                required
                value={preview.jobTitle}
                onChange={(e) => setPreview({ ...preview, jobTitle: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white outline-none"
              />
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Company Name</label>
              <input
                type="text"
                required
                value={preview.companyName}
                onChange={(e) => setPreview({ ...preview, companyName: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white outline-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Location</label>
              <input
                type="text"
                value={preview.location || ''}
                onChange={(e) => setPreview({ ...preview, location: e.target.value || null })}
                placeholder="e.g. Bangalore, India"
                className="w-full px-3 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white outline-none"
              />
            </div>

            {/* Work Mode */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Work Mode</label>
              <select
                value={preview.workMode}
                onChange={(e) => setPreview({ ...preview, workMode: e.target.value as WorkMode })}
                className="w-full px-3 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-gray-300 outline-none cursor-pointer"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Experience Required</label>
              <input
                type="text"
                value={preview.experienceRequired || ''}
                onChange={(e) => setPreview({ ...preview, experienceRequired: e.target.value || null })}
                placeholder="e.g. 3+ years"
                className="w-full px-3 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white outline-none"
              />
            </div>

            {/* Salary */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Salary Range</label>
              <input
                type="text"
                value={preview.salaryRange || ''}
                onChange={(e) => setPreview({ ...preview, salaryRange: e.target.value || null })}
                placeholder="e.g. ₹15–25 LPA or null"
                className="w-full px-3 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white outline-none"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Application Deadline</label>
              <input
                type="date"
                value={preview.applicationDeadline || ''}
                onChange={(e) => setPreview({ ...preview, applicationDeadline: e.target.value || null })}
                className="w-full px-3 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white outline-none"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Application Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2.5 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-gray-300 outline-none cursor-pointer"
              >
                <option value="Saved">Saved</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Skills tags editor */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Required Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a required skill..."
                className="flex-1 px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 bg-[#22223b] border border-[#2d2d4e] text-indigo-400 rounded-lg text-xs font-semibold hover:bg-[#2d2d4e]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg min-h-12">
              {preview.requiredSkills.length === 0 ? (
                <span className="text-xs text-gray-600 italic">No skills extracted.</span>
              ) : (
                preview.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-900/35"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      className="text-indigo-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Job Description Summary</label>
            <textarea
              rows={3}
              value={preview.jdSummary}
              onChange={(e) => setPreview({ ...preview, jdSummary: e.target.value })}
              className="w-full px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-xs text-white outline-none resize-none"
            />
          </div>

          {/* Personal Notes */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Personal Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Referred by John. Remember to follow up on Friday."
              className="w-full px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-xs text-white outline-none resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Save Action */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-glow disabled:opacity-50 transition-colors"
          >
            <Save className="w-4.5 h-4.5" />
            <span>{saving ? 'Saving Job Posting...' : 'Save Job Posting to Board'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

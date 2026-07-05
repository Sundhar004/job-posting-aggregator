'use client';

import { useState, useEffect } from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';
import type { IJobPosting } from '@/types';

interface NotesModalProps {
  job: IJobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, notes: string) => Promise<void>;
}

export default function NotesModal({ job, isOpen, onClose, onSave }: NotesModalProps) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (job) {
      setNotes(job.notes || '');
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(job._id, notes);
      onClose();
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl shadow-glow-lg overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2d4e]">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Notes: {job.jobTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs text-gray-400 mb-2">
            Add notes about interviews, contact persons, application progress, or referral info.
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type notes here... (e.g. 'Spoke to HR. Round 1 on Tuesday.')"
            rows={6}
            className="w-full px-4 py-3 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-600 outline-none resize-none transition-colors"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2d2d4e] bg-[#131324]/50">
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
            <CheckCircle className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Notes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

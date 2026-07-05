import Link from 'next/link';
import type { IJobPosting, JobStatus } from '@/types';
import DeadlineBadge from './DeadlineBadge';
import SkillMatchBadge from './SkillMatchBadge';
import { MapPin, Building2, Briefcase, FileText, ArrowRight, Trash2 } from 'lucide-react';

interface JobCardProps {
  job: IJobPosting;
  onStatusChange?: (id: string, newStatus: JobStatus) => void;
  onOpenNotes?: (job: IJobPosting) => void;
  onDelete?: (id: string) => void;
  onOpenDetail?: (job: IJobPosting) => void;
}

export default function JobCard({ job, onStatusChange, onOpenNotes, onDelete, onOpenDetail }: JobCardProps) {
  const statusColors: Record<JobStatus, string> = {
    Saved:     'border-indigo-500/30 text-indigo-400 bg-indigo-950/10',
    Applied:   'border-sky-500/30 text-sky-400 bg-sky-950/10',
    Interview: 'border-amber-500/30 text-amber-400 bg-amber-950/10',
    Offer:     'border-emerald-500/30 text-emerald-400 bg-emerald-950/10',
    Rejected:  'border-rose-500/30 text-rose-400 bg-rose-950/10',
  };

  const workModeLabels: Record<string, string> = {
    remote:  'Remote',
    hybrid:  'Hybrid',
    onsite:  'Onsite',
    unknown: 'Work Mode',
  };

  return (
    <div 
      className={`group relative bg-[#1a1a2e] border border-[#2d2d4e] hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5 flex flex-col justify-between gap-4 ${onOpenDetail ? 'cursor-pointer' : ''}`}
      onClick={() => onOpenDetail && onOpenDetail(job)}
    >
      {/* Top row: Company, Role & Match % */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate max-w-[140px]">{job.companyName}</span>
          </div>
          <SkillMatchBadge percent={job.matchPercent} />
        </div>

        <h3 className="mt-2 text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
          {job.jobTitle}
        </h3>

        {/* Location & Work Mode */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-500" />
            {job.location || 'N/A'}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-gray-500" />
            {workModeLabels[job.workMode] || 'Unknown'}
          </span>
        </div>

        {/* Extracted Skills Preview */}
        {job.requiredSkills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {job.requiredSkills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#22223b] text-indigo-300 border border-indigo-900/30"
              >
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#151525] text-gray-500">
                +{job.requiredSkills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer / Controls */}
      <div className="pt-3 border-t border-[#2d2d4e] flex items-center justify-between gap-2 mt-auto">
        <DeadlineBadge deadline={job.applicationDeadline} />

        <div className="flex items-center gap-1.5">
          {/* Notes Trigger */}
          {onOpenNotes && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenNotes(job);
              }}
              className="p-1.5 rounded bg-[#22223b] border border-indigo-900/30 text-gray-400 hover:text-indigo-300 hover:bg-[#2d2d4e] transition-colors"
              title="Application Notes"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete button - only show for Saved jobs */}
          {onDelete && job.status === 'Saved' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(job._id);
              }}
              className="p-1.5 rounded bg-[#22223b] border border-red-900/30 text-gray-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
              title="Delete Job"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick status updater dropdown */}
          {onStatusChange && (
            <select
              value={job.status}
              onChange={(e) => {
                e.stopPropagation();
                onStatusChange(job._id, e.target.value as JobStatus);
              }}
              className={`text-xs font-semibold px-2 py-1 rounded border outline-none cursor-pointer transition-colors ${statusColors[job.status]}`}
            >
              <option value="Saved" className="bg-[#1a1a2e] text-white">Saved</option>
              <option value="Applied" className="bg-[#1a1a2e] text-white">Applied</option>
              <option value="Interview" className="bg-[#1a1a2e] text-white">Interview</option>
              <option value="Offer" className="bg-[#1a1a2e] text-white">Offer</option>
              <option value="Rejected" className="bg-[#1a1a2e] text-white">Rejected</option>
            </select>
          )}

          <Link
            href={`/jobs/${job._id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
            title="View Details"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

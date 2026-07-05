import { Search, Filter, RefreshCw, Download } from 'lucide-react';
import type { WorkMode } from '@/types';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  workMode: string;
  onWorkModeChange: (val: string) => void;
  skill: string;
  onSkillChange: (val: string) => void;
  onReset: () => void;
  onExport: () => void;
  isExporting?: boolean;
}

export default function FilterBar({
  search,
  onSearchChange,
  workMode,
  onWorkModeChange,
  skill,
  onSkillChange,
  onReset,
  onExport,
  isExporting = false,
}: FilterBarProps) {
  return (
    <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card">
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search role or company..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-500 outline-none transition-colors"
          />
        </div>

        {/* Work Mode */}
        <div className="relative w-full sm:w-44">
          <select
            value={workMode}
            onChange={(e) => onWorkModeChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-gray-300 outline-none cursor-pointer appearance-none"
          >
            <option value="">All Work Modes</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite Only</option>
            <option value="unknown">Unknown</option>
          </select>
          <Filter className="absolute right-3 top-3 h-3 w-3 text-gray-500 pointer-events-none" />
        </div>

        {/* Skill Search */}
        <div className="relative w-full sm:w-48">
          <input
            type="text"
            placeholder="Filter by skill..."
            value={skill}
            onChange={(e) => onSkillChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-500 outline-none transition-colors"
          />
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#22223b] hover:bg-[#2d2d4e] border border-indigo-900/30 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition-colors w-full sm:w-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Export to CSV */}
      <button
        onClick={onExport}
        disabled={isExporting}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-semibold shadow-glow disabled:opacity-50 transition-all hover:scale-[1.02]"
      >
        <Download className="w-4 h-4" />
        <span>{isExporting ? 'Exporting...' : 'Export Applications'}</span>
      </button>
    </div>
  );
}

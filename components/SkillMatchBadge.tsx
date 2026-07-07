import { CheckCircle2 } from 'lucide-react';

interface SkillMatchBadgeProps {
  percent: number;
}

export default function SkillMatchBadge({ percent }: SkillMatchBadgeProps) {
  let colorClasses = 'text-gray-400 bg-gray-950/40 border-gray-800';
  let glowStyle = {};

  if (percent >= 75) {
    colorClasses = 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30';
    glowStyle = { boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)' };
  } else if (percent >= 40) {
    colorClasses = 'text-amber-400 bg-amber-950/20 border-amber-500/20';
    glowStyle = { boxShadow: '0 0 10px rgba(245, 158, 11, 0.1)' };
  } else if (percent > 0) {
    colorClasses = 'text-indigo-400 bg-indigo-950/20 border-indigo-500/20';
  }

  return (
    <span
      style={glowStyle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${colorClasses}`}
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span>{percent}% Match</span>
    </span>
  );
}

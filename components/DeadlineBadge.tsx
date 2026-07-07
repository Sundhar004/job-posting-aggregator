import { differenceInDays, isPast, isToday } from 'date-fns';
import { Calendar } from 'lucide-react';

interface DeadlineBadgeProps {
  deadline: string | Date | null;
}

export default function DeadlineBadge({ deadline }: DeadlineBadgeProps) {
  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-[#1a1a2e] border border-[#2d2d4e] px-2 py-0.5 rounded">
        <Calendar className="w-3 h-3" /> No deadline
      </span>
    );
  }

  const deadlineDate = new Date(deadline);
  const daysLeft = differenceInDays(deadlineDate, new Date());

  if (isPast(deadlineDate) && !isToday(deadlineDate)) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500/70 bg-red-950/20 border border-red-900/30 px-2 py-0.5 rounded">
        <Calendar className="w-3 h-3" /> Overdue
      </span>
    );
  }

  if (isToday(deadlineDate)) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/30 border border-rose-500/30 animate-pulse px-2 py-0.5 rounded">
        <Calendar className="w-3 h-3" /> Due Today
      </span>
    );
  }

  if (daysLeft < 3) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-950/30 border border-red-500/20 px-2 py-0.5 rounded">
        <Calendar className="w-3 h-3" /> {daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
      </span>
    );
  }

  if (daysLeft <= 7) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 rounded">
        <Calendar className="w-3 h-3" /> {daysLeft} days left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded">
      <Calendar className="w-3 h-3" /> {daysLeft} days left
    </span>
  );
}

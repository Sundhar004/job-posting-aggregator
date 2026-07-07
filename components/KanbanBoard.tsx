'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import type { IJobPosting, JobStatus, KanbanColumn } from '@/types';
import JobCard from './JobCard';

interface KanbanBoardProps {
  jobs: IJobPosting[];
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onOpenNotes: (job: IJobPosting) => void;
  onDelete?: (id: string) => void;
  onOpenDetail?: (job: IJobPosting) => void;
}

export default function KanbanBoard({ jobs, onStatusChange, onOpenNotes, onDelete, onOpenDetail }: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false);

  // Set mounted true on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const columnsList: { id: JobStatus; title: string; color: string }[] = [
    { id: 'Saved',     title: 'Saved',     color: 'border-indigo-500 bg-indigo-500/10 text-indigo-400' },
    { id: 'Applied',   title: 'Applied',   color: 'border-sky-500 bg-sky-500/10 text-sky-400' },
    { id: 'Interview', title: 'Interview', color: 'border-amber-500 bg-amber-500/10 text-amber-400' },
    { id: 'Offer',     title: 'Offer',     color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
    { id: 'Rejected',  title: 'Rejected',  color: 'border-rose-500 bg-rose-500/10 text-rose-400' },
  ];

  // Group jobs by status
  const columns: KanbanColumn[] = columnsList.map((col) => ({
    ...col,
    jobs: jobs.filter((job) => job.status === col.id),
  }));

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Check if status changed
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as JobStatus;
    onStatusChange(draggableId, newStatus);
  };

  if (!mounted) {
    // Render static grid for SSR placeholder
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {columnsList.map((col) => (
          <div key={col.id} className="bg-[#131324] border border-[#2d2d4e] rounded-xl p-3 flex flex-col gap-3 min-h-[400px]">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${col.color}`}>
              {col.title}
            </div>
            <div className="flex flex-col gap-3">
              {jobs
                .filter((j) => j.status === col.id)
                .map((job) => (
                  <JobCard key={job._id} job={job} onDelete={onDelete} onOpenDetail={onOpenDetail} />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        {columns.map((col) => (
          <Droppable key={col.id} droppableId={col.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`bg-[#131324] border border-[#2d2d4e] rounded-xl p-3 flex flex-col gap-3 min-h-[500px] transition-colors duration-200 ${
                  snapshot.isDraggingOver ? 'bg-[#181830] border-indigo-500/35' : ''
                }`}
              >
                {/* Header */}
                <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-bold ${col.color}`}>
                  <span>{col.title}</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                    {col.jobs.length}
                  </span>
                </div>

                {/* Job Cards List */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                  {col.jobs.map((job, index) => (
                    <Draggable key={job._id} draggableId={job._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                          className={`${snapshot.isDragging ? 'rotate-[2deg] scale-[1.02] shadow-glow-lg' : ''}`}
                        >
                          <JobCard
                            job={job}
                            onStatusChange={onStatusChange}
                            onOpenNotes={onOpenNotes}
                            onDelete={onDelete}
                            onOpenDetail={onOpenDetail}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

'use client';

import React, { useState } from 'react';
import { Project, ProjectTask, TaskStatus, TaskPriority } from '@/packages/types/src';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckSquare, Plus, UserCheck } from 'lucide-react';

interface TasksTabProps {
  project: Project;
  tasks: ProjectTask[];
  onAddTask: (task: Partial<ProjectTask>) => Promise<void>;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  project,
  tasks,
  onAddTask
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignedRole, setAssignedRole] = useState('Engineer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || loading) return;

    setLoading(true);
    await onAddTask({
      title,
      description,
      status: 'TODO',
      priority,
      assignedRole
    });
    setTitle('');
    setDescription('');
    setLoading(false);
    setShowAdd(false);
  };

  const statusColumns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  return (
    <div className="p-6 space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            Project Execution Tasks — {project.name}
          </h2>
          <p className="text-xs text-zinc-400">Architectural roadmap and implementation task board</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          <span>New Task</span>
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Assigned Role</label>
              <input
                type="text"
                value={assignedRole}
                onChange={e => setAssignedRole(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Task details..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>Create Task</Button>
          </div>
        </form>
      )}

      {/* Task Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusColumns.map(col => {
          const colTasks = tasks.filter(t => t.status === col);
          return (
            <div key={col} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between font-semibold text-zinc-300 border-b border-zinc-800/60 pb-2">
                <span className="capitalize">{col.replace('_', ' ')}</span>
                <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full text-[10px]">{colTasks.length}</span>
              </div>

              <div className="space-y-2">
                {colTasks.length === 0 ? (
                  <div className="p-3 text-center text-[11px] text-zinc-600 italic">
                    No tasks
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div key={task.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-medium text-zinc-200">{task.title}</span>
                        <Badge variant={task.priority === 'CRITICAL' ? 'destructive' : task.priority === 'HIGH' ? 'warning' : 'default'}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                        <span className="flex items-center gap-1"><UserCheck className="w-3 h-3 text-indigo-400" /> {task.assignedRole}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

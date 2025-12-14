import React from 'react';
import { Card } from '../common/Card';

interface TaskCardProps {
  task: any;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDelete }) => {
  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<string, string> = {
    todo: 'bg-gray-200 text-gray-800',
    in_progress: 'bg-blue-200 text-blue-800',
    review: 'bg-yellow-200 text-yellow-800',
    completed: 'bg-green-200 text-green-800',
  };

  const priority = task.priority?.toLowerCase() || 'medium';
  const status = task.status?.toLowerCase() || 'todo';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      onDelete?.(task.id);
    }
  };

  return (
    <Card onClick={onClick}>
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
          <div className="flex items-center gap-1">
            <span className={`px-2 py-1 rounded text-xs ${priorityColors[priority]}`}>
              {task.priority}
            </span>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded text-xs ${statusColors[status]}`}>
            {task.status?.replace('_', ' ')}
          </span>
          {task.commentCount > 0 && (
            <span className="text-xs text-gray-500">{task.commentCount} comments</span>
          )}
        </div>
      </div>
    </Card>
  );
};

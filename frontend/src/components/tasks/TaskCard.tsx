import React from 'react';
import { Card } from '../common/Card';

interface TaskCardProps {
  task: any;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
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

  return (
    <Card onClick={onClick}>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-gray-900">{task.title}</h4>
          <span className={`px-2 py-1 rounded text-xs ${priorityColors[priority]}`}>
            {task.priority}
          </span>
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

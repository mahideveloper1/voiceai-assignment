import React from 'react';
import { Card } from '../common/Card';

interface ProjectCardProps {
  project: any;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onDelete }) => {
  const statusColors: Record<string, string> = {
    planning: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-orange-100 text-orange-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      onDelete?.(project.id);
    }
  };

  return (
    <Card onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${statusColors[project.status]}`}>
            {project.status.replace('_', ' ')}
          </span>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete project"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold">
            {project.taskStats?.completionRate || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${project.taskStats?.completionRate || 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{project.taskStats?.completed || 0} completed</span>
          <span>{project.taskStats?.total || 0} total tasks</span>
        </div>
      </div>
    </Card>
  );
};

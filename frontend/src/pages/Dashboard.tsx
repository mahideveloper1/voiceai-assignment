import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_PROJECTS } from '../graphql/queries/projects';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { useOrganization } from '../contexts/OrganizationContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { data, loading, error } = useQuery(GET_PROJECTS);

  if (!currentOrganization || loading) return <div className="text-center py-8"><Spinner /></div>;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  const projects = data?.projects || [];
  const activeProjects = projects.filter((p: any) => p.status?.toLowerCase() === 'active');
  const recentProjects = projects.slice(0, 6);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Overview of your projects and tasks for{' '}
            <span className="font-semibold text-blue-600">{currentOrganization.name}</span>
          </p>
        </div>
        <Button onClick={() => navigate('/projects')} >
          View All Projects
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 lg:p-8 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-100 text-xs lg:text-sm font-medium uppercase tracking-wide">Total Projects</h3>
            <svg className="w-8 h-8 text-blue-200 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-4xl lg:text-5xl font-bold">{projects.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 lg:p-8 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-purple-100 text-xs lg:text-sm font-medium uppercase tracking-wide">Active Projects</h3>
            <svg className="w-8 h-8 text-purple-200 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-4xl lg:text-5xl font-bold">{activeProjects.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 lg:p-8 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-100 text-xs lg:text-sm font-medium uppercase tracking-wide">Completion Rate</h3>
            <svg className="w-8 h-8 text-green-200 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-4xl lg:text-5xl font-bold">
            {projects.length > 0
              ? Math.round(
                  projects.reduce((sum: number, p: any) => sum + (p.taskStats?.completionRate || 0), 0) /
                    projects.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Recent Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentProjects.map((project: any) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECTS } from '../graphql/queries/projects';
import { CREATE_PROJECT, DELETE_PROJECT } from '../graphql/mutations/projects';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { useOrganization } from '../contexts/OrganizationContext';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
    variables: { search: debouncedSearch, status: status || undefined },
    fetchPolicy: 'cache-and-network',
  });

  const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });

  const [deleteProject] = useMutation(DELETE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });

  const handleCreateProject = async () => {
    if (!currentOrganization) {
      alert('No organization selected. Please select an organization first.');
      return;
    }

    const name = prompt('Enter project name:');
    if (!name) return;

    const description = prompt('Enter project description (optional):') || '';

    try {
      await createProject({
        variables: {
          organizationId: currentOrganization.id,
          name,
          description,
          status: 'planning',
        },
      });
      refetch();
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Error creating project. Check console for details.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject({
        variables: { id },
      });
      refetch();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Error deleting project. Check console for details.');
    }
  };

  // Only show spinner on initial load, not on refetches
  const isInitialLoading = loading && !data;

  if (!currentOrganization) return <div className="text-center py-8"><Spinner /></div>;
  if (isInitialLoading) return <div className="text-center py-8"><Spinner /></div>;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  const projects = data?.projects || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organization: <span className="font-semibold text-blue-600">{currentOrganization.name}</span>
          </p>
        </div>
        <Button onClick={handleCreateProject} loading={creating}>
          Create Project
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: any) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => navigate(`/projects/${project.id}`)}
            onDelete={handleDeleteProject}
          />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No projects found. Create your first project to get started!
        </div>
      )}
    </div>
  );
};

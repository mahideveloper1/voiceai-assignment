import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECT } from '../graphql/queries/projects';
import { GET_TASKS } from '../graphql/queries/tasks';
import { GET_TASK_COMMENTS } from '../graphql/queries/comments';
import { CREATE_TASK, UPDATE_TASK } from '../graphql/mutations/tasks';
import { UPDATE_PROJECT } from '../graphql/mutations/projects';
import { CREATE_COMMENT } from '../graphql/mutations/comments';
import { TaskCard } from '../components/tasks/TaskCard';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [commentText, setCommentText] = useState('');

  const { data: projectData, loading: projectLoading } = useQuery(GET_PROJECT, {
    variables: { id },
    skip: !id,
  });

  const { data: tasksData, loading: tasksLoading, refetch } = useQuery(GET_TASKS, {
    variables: { projectId: id },
    skip: !id,
  });

  const { data: commentsData, loading: commentsLoading, refetch: refetchComments } = useQuery(GET_TASK_COMMENTS, {
    variables: { taskId: selectedTask?.id },
    skip: !selectedTask?.id,
  });

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK, {
    refetchQueries: [
      { query: GET_TASKS, variables: { projectId: id } },
      { query: GET_PROJECT, variables: { id } }
    ],
    awaitRefetchQueries: true,
  });

  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: [
      { query: GET_TASKS, variables: { projectId: id } },
      { query: GET_PROJECT, variables: { id } }
    ],
    awaitRefetchQueries: true,
  });

  const [updateProject] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECT, variables: { id } }],
  });

  const [createComment, { loading: addingComment }] = useMutation(CREATE_COMMENT, {
    refetchQueries: [{ query: GET_TASK_COMMENTS, variables: { taskId: selectedTask?.id } }],
  });

  const handleCreateTask = async () => {
    const title = prompt('Enter task title:');
    if (!title) return;

    const description = prompt('Enter task description (optional):') || '';

    try {
      const result = await createTask({
        variables: {
          projectId: id,
          title,
          description,
          status: 'todo',
          priority: 'medium',
          order: 0,
        },
      });
      console.log('Task created:', result);
      await refetch();
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Error creating task. Check console for details.');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateTask({
        variables: { id: taskId, status: newStatus },
      });
      // Update selected task state with new status (backend returns uppercase)
      setSelectedTask({ ...selectedTask, status: newStatus.toUpperCase() });
      await refetch();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleUpdateProjectStatus = async (newStatus: string) => {
    try {
      await updateProject({
        variables: { id, status: newStatus },
      });
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await createComment({
        variables: {
          taskId: selectedTask.id,
          authorName: 'User', // In a real app, get from auth context
          content: commentText,
        },
      });
      setCommentText('');
      await refetchComments();
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  if (projectLoading || tasksLoading) return <div className="text-center py-8"><Spinner /></div>;

  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];

  console.log('Tasks data:', tasksData);
  console.log('Tasks array:', tasks);
  console.log('Project ID:', id);

  const tasksByStatus = {
    todo: tasks.filter((t: any) => t.status?.toLowerCase() === 'todo'),
    in_progress: tasks.filter((t: any) => t.status?.toLowerCase() === 'in_progress'),
    review: tasks.filter((t: any) => t.status?.toLowerCase() === 'review'),
    completed: tasks.filter((t: any) => t.status?.toLowerCase() === 'completed'),
  };

  console.log('Tasks by status:', tasksByStatus);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{project?.name}</h1>
            <p className="text-gray-600 mt-2">{project?.description}</p>
          </div>
          <Button onClick={handleCreateTask} loading={creating}>
            Add Task
          </Button>
        </div>

        <div className="flex gap-4 items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <select
              value={project?.status?.toLowerCase()}
              onChange={(e) => handleUpdateProjectStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <span>Total Tasks: <span className="font-semibold">{tasks.length}</span></span>
          <span>Progress: <span className="font-semibold">{project?.taskStats?.completionRate || 0}%</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['todo', 'in_progress', 'review', 'completed'].map((status) => (
          <div key={status} className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4 capitalize">
              {status.replace('_', ' ')} ({tasksByStatus[status as keyof typeof tasksByStatus].length})
            </h3>
            <div className="space-y-3">
              {tasksByStatus[status as keyof typeof tasksByStatus].map((task: any) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">{selectedTask.title}</h2>
            <p className="text-gray-600 mb-4">{selectedTask.description}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Change Status:</label>
              <select
                value={selectedTask.status?.toLowerCase()}
                onChange={(e) => handleUpdateTaskStatus(selectedTask.id, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Comments</h3>

              {commentsLoading ? (
                <div className="text-center py-4"><Spinner /></div>
              ) : (
                <div className="space-y-3 mb-4">
                  {commentsData?.taskComments?.length > 0 ? (
                    commentsData.taskComments.map((comment: any) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm">{comment.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No comments yet.</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleAddComment} loading={addingComment} disabled={!commentText.trim()}>
                  Add
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button onClick={() => setSelectedTask(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { gql } from '@apollo/client';

export const TASK_UPDATED = gql`
  subscription TaskUpdated($projectId: UUID) {
    taskUpdated(projectId: $projectId) {
      id
      title
      description
      status
      priority
      dueDate
      order
      updatedAt
    }
  }
`;

export const TASK_CREATED = gql`
  subscription TaskCreated($projectId: UUID) {
    taskCreated(projectId: $projectId) {
      id
      title
      description
      status
      priority
      dueDate
      order
      createdAt
    }
  }
`;

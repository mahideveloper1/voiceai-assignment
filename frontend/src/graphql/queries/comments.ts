import { gql } from '@apollo/client';

export const GET_TASK_COMMENTS = gql`
  query GetTaskComments($taskId: UUID!, $limit: Int, $offset: Int) {
    taskComments(taskId: $taskId, limit: $limit, offset: $offset) {
      id
      authorName
      authorEmail
      content
      createdAt
      updatedAt
    }
  }
`;

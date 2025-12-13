import { gql } from '@apollo/client';

export const GET_TASKS = gql`
  query GetTasks(
    $projectId: UUID
    $status: String
    $priority: String
    $search: String
    $limit: Int
    $offset: Int
  ) {
    tasks(
      projectId: $projectId
      status: $status
      priority: $priority
      search: $search
      limit: $limit
      offset: $offset
    ) {
      id
      title
      description
      status
      priority
      dueDate
      order
      commentCount
      createdAt
      updatedAt
    }
  }
`;

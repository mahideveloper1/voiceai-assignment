import { gql } from '@apollo/client';

export const CREATE_TASK = gql`
  mutation CreateTask(
    $projectId: UUID!
    $title: String!
    $description: String
    $status: String
    $priority: String
    $dueDate: DateTime
    $order: Int
  ) {
    createTask(
      projectId: $projectId
      title: $title
      description: $description
      status: $status
      priority: $priority
      dueDate: $dueDate
      order: $order
    ) {
      task {
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
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: UUID!
    $title: String
    $description: String
    $status: String
    $priority: String
    $dueDate: DateTime
    $order: Int
  ) {
    updateTask(
      id: $id
      title: $title
      description: $description
      status: $status
      priority: $priority
      dueDate: $dueDate
      order: $order
    ) {
      task {
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
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: UUID!) {
    deleteTask(id: $id) {
      success
    }
  }
`;

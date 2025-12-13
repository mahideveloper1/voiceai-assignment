import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjects($status: String, $search: String, $limit: Int, $offset: Int) {
    projects(status: $status, search: $search, limit: $limit, offset: $offset) {
      id
      name
      description
      status
      startDate
      endDate
      taskStats {
        total
        todo
        inProgress
        completed
        completionRate
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: UUID!) {
    project(id: $id) {
      id
      name
      description
      status
      startDate
      endDate
      taskStats {
        total
        todo
        inProgress
        completed
        completionRate
      }
      createdAt
      updatedAt
    }
  }
`;

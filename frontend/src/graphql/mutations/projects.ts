import { gql } from '@apollo/client';

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $organizationId: UUID!
    $name: String!
    $description: String
    $status: String
    $startDate: Date
    $endDate: Date
  ) {
    createProject(
      organizationId: $organizationId
      name: $name
      description: $description
      status: $status
      startDate: $startDate
      endDate: $endDate
    ) {
      project {
        id
        name
        description
        status
        startDate
        endDate
        createdAt
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: UUID!
    $name: String
    $description: String
    $status: String
    $startDate: Date
    $endDate: Date
  ) {
    updateProject(
      id: $id
      name: $name
      description: $description
      status: $status
      startDate: $startDate
      endDate: $endDate
    ) {
      project {
        id
        name
        description
        status
        startDate
        endDate
        updatedAt
      }
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: UUID!) {
    deleteProject(id: $id) {
      success
    }
  }
`;

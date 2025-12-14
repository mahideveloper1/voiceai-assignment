import { gql } from '@apollo/client';

export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
      description
      contactEmail
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization($id: UUID!) {
    organization(id: $id) {
      id
      name
      slug
      description
      contactEmail
      isActive
      createdAt
      updatedAt
    }
  }
`;

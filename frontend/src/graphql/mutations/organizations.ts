import { gql } from '@apollo/client';

export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization(
    $name: String!
    $description: String
    $contactEmail: String
  ) {
    createOrganization(
      name: $name
      description: $description
      contactEmail: $contactEmail
    ) {
      organization {
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
  }
`;

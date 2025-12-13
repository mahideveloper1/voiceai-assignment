import { gql } from '@apollo/client';

export const CREATE_COMMENT = gql`
  mutation CreateComment(
    $taskId: UUID!
    $authorName: String!
    $content: String!
  ) {
    createComment(
      taskId: $taskId
      authorName: $authorName
      content: $content
    ) {
      comment {
        id
        authorName
        content
        createdAt
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: UUID!) {
    deleteComment(id: $id) {
      success
    }
  }
`;

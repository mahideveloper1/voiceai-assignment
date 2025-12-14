import { gql } from '@apollo/client';

export const COMMENT_CREATED = gql`
  subscription CommentCreated($taskId: UUID!) {
    commentCreated(taskId: $taskId) {
      id
      authorName
      authorEmail
      content
      createdAt
      updatedAt
      task {
        id
      }
    }
  }
`;

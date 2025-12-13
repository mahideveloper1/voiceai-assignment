export interface TaskComment {
  id: string;
  taskId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentFormData {
  authorName: string;
  content: string;
}

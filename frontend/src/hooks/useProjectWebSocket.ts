import { useEffect, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  task?: any;
  task_id?: string;
  comment?: any;
}

interface UseProjectWebSocketOptions {
  projectId: string | undefined;
  onTaskCreated?: (task: any) => void;
  onTaskUpdated?: (task: any) => void;
  onTaskDeleted?: (taskId: string) => void;
  onCommentCreated?: (comment: any) => void;
}

export const useProjectWebSocket = ({
  projectId,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onCommentCreated,
}: UseProjectWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // Connect to Django Channels WebSocket
    const wsUrl = `ws://localhost:8000/ws/projects/${projectId}/`;
    console.log('[WebSocket] Connecting to:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected to project:', projectId);
      // Subscribe to updates
      ws.send(JSON.stringify({ type: 'subscribe' }));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('[WebSocket] Received:', message);

        switch (message.type) {
          case 'task_created':
            if (onTaskCreated && message.task) {
              onTaskCreated(message.task);
            }
            break;
          case 'task_updated':
            if (onTaskUpdated && message.task) {
              onTaskUpdated(message.task);
            }
            break;
          case 'task_deleted':
            if (onTaskDeleted && message.task_id) {
              onTaskDeleted(message.task_id);
            }
            break;
          case 'comment_created':
            if (onCommentCreated && message.comment) {
              onCommentCreated(message.comment);
            }
            break;
          case 'subscription_success':
            console.log('[WebSocket] Subscription confirmed');
            break;
          default:
            console.log('[WebSocket] Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected from project:', projectId);
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [projectId, onTaskCreated, onTaskUpdated, onTaskDeleted, onCommentCreated]);

  return wsRef;
};

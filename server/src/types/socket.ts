// ──────────────────────────────────────────────
// Socket.io typed event contracts
// ──────────────────────────────────────────────

/** Events emitted FROM the server TO clients */

// ensures type safety in payload from server to client events
export interface ServerToClientEvents {
  'message:new': (payload: {
    id: number;
    room_id: string;
    content: string;
    media_url: string | null;
    message_type: string;
    created_at: string;
    sender: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
  }) => void;

  'typing:update': (payload: {
    roomId: string;
    userId: string;
    username: string;
    isTyping: boolean;
  }) => void;

  'user:online': (payload: {
    userId: string;
    isOnline: boolean;
  }) => void;
}

/** Events emitted FROM clients TO the server */
export interface ClientToServerEvents {
  'room:join': (payload: { roomId: string }) => void;
  'room:leave': (payload: { roomId: string }) => void;
  'typing:start': (payload: { roomId: string }) => void;
  'typing:stop': (payload: { roomId: string }) => void;
}

/** Data attached to each socket instance after authentication */
export interface SocketData {
  user: {
    userId: string;
    email: string;
    username: string;
  };
}

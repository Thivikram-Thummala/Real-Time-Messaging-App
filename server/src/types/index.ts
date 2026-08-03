// ──────────────────────────────────────────────
// Core domain interfaces for the chat system
// ──────────────────────────────────────────────

// this file is used to define the types(schema for the data structures) of chat system 
// so that we can use these types throughout the application
// and maintain the type safety

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen_at: string;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  is_private: boolean;
  created_at: string;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Message {
  id: number;
  room_id: string;
  sender_id: string;
  content: string;
  media_url: string | null;
  message_type: 'text' | 'image' | 'file';
  is_edited: boolean;
  created_at: string;
  // Joined fields from users table
  username?: string;
  avatar_url?: string;
}

/** JWT payload attached to req.user after auth middleware */
export interface AuthPayload {
  userId: string;
  email: string;
}

/** Standard API response envelope */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ──────────────────────────────────────────────
// Augment Express Request to include user info
// ──────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

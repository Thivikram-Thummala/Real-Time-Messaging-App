-- ============================================================
-- Monolithic Chat System — Initial Database Schema
-- ============================================================
-- Tables: users, rooms, room_members, messages
-- Run via: npm run migrate
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- USERS — stores registered user accounts
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(512),
  is_online     BOOLEAN DEFAULT false,
  last_seen_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────
-- ROOMS — chat room definitions
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  is_private  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────
-- ROOM_MEMBERS — many-to-many: users ↔ rooms
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS room_members (
  room_id   UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  role      VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);

-- ──────────────────────────────────────────────
-- MESSAGES — individual chat messages
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id            BIGSERIAL PRIMARY KEY,
  room_id       UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id     UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content       TEXT NOT NULL,
  media_url     VARCHAR(512),
  message_type  VARCHAR(20) DEFAULT 'text',
  is_edited     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────
-- PERFORMANCE INDEXES
-- ──────────────────────────────────────────────

-- Fast login lookup by email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Username uniqueness checks
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Find all rooms a user belongs to
CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(user_id);

-- Message history pagination (newest first)
CREATE INDEX IF NOT EXISTS idx_messages_room_timeline ON messages(room_id, created_at DESC);

-- Cursor-based pagination by message ID
CREATE INDEX IF NOT EXISTS idx_messages_cursor ON messages(room_id, id DESC);

-- Room lookups
CREATE INDEX IF NOT EXISTS idx_rooms_name ON rooms(name);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);

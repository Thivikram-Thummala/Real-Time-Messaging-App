import pg from 'pg';

type Pool = pg.Pool;

/**
 * Insert a new message into a room.
 * Returns the full message row including the auto-generated id and created_at.
 */
export const insertMessage = (
  pool: Pool,
  roomId: string,
  senderId: string,
  content?: string | null,
  mediaUrl?: string | null,
  messageType: string = 'text'
) =>
  pool.query(
    `INSERT INTO messages (room_id, sender_id, content, media_url, message_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [roomId, senderId, content ?? null, mediaUrl ?? null, messageType]
  );

/**
 * Fetch messages for a room using cursor-based pagination.
 *
 * How it works:
 * - If no cursor is provided, fetches the newest `limit` messages.
 * - If a cursor (message ID) is provided, fetches messages with id < cursor
 *   (i.e. older messages), ordered newest-first.
 * - JOINs with users table to include sender username and avatar.
 *
 * @param pool   - PostgreSQL connection pool
 * @param roomId - The room to fetch messages from
 * @param cursor - Optional message ID to paginate from (fetch older messages)
 * @param limit  - Number of messages to fetch (default 50)
 */
export const getMessagesByRoom = (
  pool: Pool,
  roomId: string,
  cursor?: number | string | null,
  limit: number = 50
) => {
  if (cursor) {
    return pool.query(
      `SELECT m.*, u.username, u.avatar_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1 AND m.id < $3
       ORDER BY m.id DESC
       LIMIT $2`,
      [roomId, limit, cursor]
    );
  }

  return pool.query(
    `SELECT m.*, u.username, u.avatar_url
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.room_id = $1
     ORDER BY m.id DESC
     LIMIT $2`,
    [roomId, limit]
  );
};

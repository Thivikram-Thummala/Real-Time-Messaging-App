/**
 * Create a new room and automatically add the creator as an 'admin' member.
 * Wrapped in a SQL transaction for atomicity — if member insertion fails,
 * the room creation is also rolled back.
 */
export const createRoom = async (
  pool,
  name,
  description,
  createdBy,
  isPrivate = false
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const roomResult = await client.query(
      `INSERT INTO rooms (name, description, created_by, is_private)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, createdBy, isPrivate]
    );

    const room = roomResult.rows[0];

    // Auto-add the creator as an admin member
    await client.query(
      `INSERT INTO room_members (room_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [room.id, createdBy]
    );

    await client.query('COMMIT');
    return roomResult;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * List all rooms that a specific user is a member of.
 * JOINs room_members with rooms to return full room details.
 */
export const findUserRooms = (pool, userId) =>
  pool.query(
    `SELECT r.*, rm.role, rm.joined_at AS member_since
     FROM rooms r
     JOIN room_members rm ON r.id = rm.room_id
     WHERE rm.user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );

/**
 * Find a single room by its UUID.
 */
export const findById = (pool, roomId) =>
  pool.query(
    `SELECT * FROM rooms WHERE id = $1`,
    [roomId]
  );

/**
 * Get all members of a room, with user profile info.
 */
export const getMembers = (pool, roomId) =>
  pool.query(
    `SELECT u.id, u.username, u.avatar_url, u.is_online, rm.role, rm.joined_at
     FROM room_members rm
     JOIN users u ON rm.user_id = u.id
     WHERE rm.room_id = $1
     ORDER BY rm.joined_at ASC`,
    [roomId]
  );

/**
 * Add a user as a member of a room.
 * Uses ON CONFLICT to silently ignore if already a member.
 */
export const addMember = (pool, roomId, userId, role = 'member') =>
  pool.query(
    `INSERT INTO room_members (room_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (room_id, user_id) DO NOTHING
     RETURNING *`,
    [roomId, userId, role]
  );

/**
 * Remove a user from a room.
 */
export const removeMember = (pool, roomId, userId) =>
  pool.query(
    `DELETE FROM room_members
     WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId]
  );

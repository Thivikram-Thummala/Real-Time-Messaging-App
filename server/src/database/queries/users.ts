import pg from 'pg';

type Pool = pg.Pool;

/**
 * Insert a new user into the database.
 * Password must be pre-hashed before calling this function.
 */
export const createUser = (
  pool: Pool,
  username: string,
  email: string,
  passwordHash: string,
  avatarUrl?: string | null
) =>
  pool.query(
    `INSERT INTO users (username, email, password_hash, avatar_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, avatar_url, is_online, last_seen_at, created_at`,
    [username, email, passwordHash, avatarUrl ?? null]
  );

/**
 * Find a user by email address (used during login).
 * Returns the password_hash for bcrypt comparison.
 */
export const findByEmail = (pool: Pool, email: string) =>
  pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

/**
 * Find a user by their UUID (used for profile lookups and sender enrichment).
 */
export const findById = (pool: Pool, id: string) =>
  pool.query(
    `SELECT id, username, email, avatar_url, is_online, last_seen_at, created_at
     FROM users WHERE id = $1`,
    [id]
  );

/**
 * Search users by username or email.
 */
export const searchUsers = (pool: Pool, search: string) =>
  pool.query(
    `SELECT id, username, email, avatar_url, is_online
     FROM users
     WHERE username ILIKE $1 OR email ILIKE $1
     LIMIT 20`,
    [`%${search}%`]
  );

/**
 * Update a user's online status and last_seen_at timestamp.
 * Called by Socket.io connection/disconnect handlers.
 */
export const updateOnlineStatus = (pool: Pool, userId: string, isOnline: boolean) =>
  pool.query(
    `UPDATE users
     SET is_online = $2, last_seen_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [userId, isOnline]
  );

/**
 * Update user profile (username).
 */
export const updateProfileQuery = (pool: Pool, userId: string, username: string) =>
  pool.query(
    `UPDATE users
     SET username = $2
     WHERE id = $1
     RETURNING id, username, email, avatar_url, is_online, last_seen_at, created_at`,
    [userId, username]
  );


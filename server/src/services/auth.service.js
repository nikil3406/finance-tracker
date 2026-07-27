import bcrypt from 'bcryptjs';
import { dbRun, dbGet } from '../db.js';
import { signToken } from '../middleware/auth.middleware.js';
import { ApiError } from '../utils/ApiError.js';

export async function registerUser({ username, email, password }) {
  if (!username || !email || !password) {
    throw new ApiError(400, 'username, email, password are required');
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const result = await dbRun(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    const token = signToken({ userId: result.lastID, username });
    return { token, user: { username, email } };
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes('UNIQUE')) {
      throw new ApiError(409, 'username or email already exists');
    }
    throw e;
  }
}

export async function loginUser({ usernameOrEmail, password }) {
  if (!usernameOrEmail || !password) {
    throw new ApiError(400, 'usernameOrEmail and password are required');
  }

  const userRow = await dbGet(
    'SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?',
    [usernameOrEmail, usernameOrEmail]
  );

  if (!userRow) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const ok = bcrypt.compareSync(password, userRow.password_hash);
  if (!ok) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = signToken({ userId: userRow.id, username: userRow.username });
  return { token, user: { username: userRow.username, email: userRow.email } };
}

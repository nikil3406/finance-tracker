import express from 'express';
import bcrypt from 'bcryptjs';
import { dbRun, dbGet } from '../db.js';
import { signToken } from '../auth.js';

const router = express.Router();

router.post('/register', express.json(), async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email, password are required' });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  try {
    const result = await dbRun(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );

    const token = signToken({ userId: result.lastID, username });
    return res.status(201).json({ token, user: { username, email } });
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes('UNIQUE')) {
      return res.status(409).json({ message: 'username or email already exists' });
    }
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', express.json(), async (req, res) => {
  const { usernameOrEmail, password } = req.body || {};

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ message: 'usernameOrEmail and password are required' });
  }

  const userRow = await dbGet(
    'SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?',
    [usernameOrEmail, usernameOrEmail]
  );

  if (!userRow) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = bcrypt.compareSync(password, userRow.password_hash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({ userId: userRow.id, username: userRow.username });
  return res.json({ token, user: { username: userRow.username, email: userRow.email } });
});

export default router;


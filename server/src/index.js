import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDb } from './db.js';

import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api', authRoutes);
app.use('/api/me', meRoutes);

initDb();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


import express from 'express';
import authRoutes from './auth.routes.js';
import itemRoutes from './item.routes.js';

const router = express.Router();

router.use('/', authRoutes);
router.use('/me', itemRoutes);

export default router;

import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as itemController from '../controllers/item.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/data', itemController.getData);
router.post('/data/items', itemController.addItem);
router.put('/data/items/:id', itemController.updateItem);
router.delete('/data/items/:id', itemController.deleteItem);
router.delete('/data/categories/:type/:categoryName', itemController.deleteCategory);

export default router;

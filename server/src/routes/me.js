import express from 'express';
import { authMiddleware } from '../auth.js';
import { dbAll, dbGet, dbRun } from '../db.js';

const router = express.Router();
router.use(authMiddleware);

const DEFAULT_CATEGORIES = {
  income: { 'Salary': '💼', 'Side Hustle': '💻' },
  expense: { 'Housing': '🏠', 'Food': '🍔', 'Bills': '💳' }
};

router.get('/data', express.json(), async (req, res) => {
  const userId = req.user.userId;

  const incomeRows = await dbAll(
    'SELECT id, type, name, amount, category FROM items WHERE user_id = ? AND type = ? ORDER BY id',
    [userId, 'income']
  );
  const expenseRows = await dbAll(
    'SELECT id, type, name, amount, category FROM items WHERE user_id = ? AND type = ? ORDER BY id',
    [userId, 'expense']
  );

  const income = incomeRows.map((r) => ({ id: r.id, name: r.name, amount: Number(r.amount), category: r.category }));
  const expense = expenseRows.map((r) => ({ id: r.id, name: r.name, amount: Number(r.amount), category: r.category }));

  const categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));

  for (const t of ['income', 'expense']) {
    const rows = await dbAll(
      'SELECT DISTINCT category FROM items WHERE user_id = ? AND type = ? AND category IS NOT NULL',
      [userId, t]
    );

    for (const row of rows) {
      if (!categories[t][row.category]) {
        categories[t][row.category] = '📁';
      }
    }
  }

  if (income.length === 0 && expense.length === 0) {
    await dbRun(
      'INSERT INTO items (user_id, type, name, amount, category) VALUES (?, ?, ?, ?, ?)',
      [userId, 'income', 'Monthly Salary', 75000, 'Salary']
    );
    await dbRun(
      'INSERT INTO items (user_id, type, name, amount, category) VALUES (?, ?, ?, ?, ?)',
      [userId, 'expense', 'Rent', 20000, 'Housing']
    );

    const income2 = await dbAll(
      'SELECT id, type, name, amount, category FROM items WHERE user_id = ? AND type = ? ORDER BY id',
      [userId, 'income']
    );
    const expense2 = await dbAll(
      'SELECT id, type, name, amount, category FROM items WHERE user_id = ? AND type = ? ORDER BY id',
      [userId, 'expense']
    );

    return res.json({
      data: {
        income: income2.map((r) => ({ id: r.id, name: r.name, amount: Number(r.amount), category: r.category })),
        expense: expense2.map((r) => ({ id: r.id, name: r.name, amount: Number(r.amount), category: r.category })),
      },
      categories,
    });
  }

  return res.json({ data: { income, expense }, categories });
});

router.post('/data/items', express.json(), async (req, res) => {
  const userId = req.user.userId;
  const { type, name, amount, category } = req.body || {};

  if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'type must be income or expense' });
  if (!name || typeof amount !== 'number') return res.status(400).json({ message: 'name and numeric amount are required' });

  const result = await dbRun(
    'INSERT INTO items (user_id, type, name, amount, category) VALUES (?, ?, ?, ?, ?)',
    [userId, type, name, amount, category || null]
  );
  return res.status(201).json({ id: result.lastID });
});

router.put('/data/items/:id', express.json(), async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);
  const { type, name, amount, category } = req.body || {};

  if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'type must be income or expense' });
  if (!name || typeof amount !== 'number') return res.status(400).json({ message: 'name and numeric amount are required' });

  const result = await dbRun(
    'UPDATE items SET type = ?, name = ?, amount = ?, category = ?, updated_at = datetime(\'now\') WHERE id = ? AND user_id = ?',
    [type, name, amount, category || null, id, userId]
  );
  if (result.changes === 0) return res.status(404).json({ message: 'Item not found' });
  return res.json({ ok: true });
});

router.delete('/data/items/:id', async (req, res) => {
  const userId = req.user.userId;
  const id = Number(req.params.id);

  const result = await dbRun('DELETE FROM items WHERE id = ? AND user_id = ?', [id, userId]);
  if (result.changes === 0) return res.status(404).json({ message: 'Item not found' });
  return res.json({ ok: true });
});

router.delete('/data/categories/:type/:categoryName', async (req, res) => {
  const userId = req.user.userId;
  const { type, categoryName } = req.params;
  if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'invalid type' });

  const result = await dbRun('DELETE FROM items WHERE user_id = ? AND type = ? AND category = ?', [userId, type, categoryName]);
  return res.json({ deleted: result.changes });
});

export default router;


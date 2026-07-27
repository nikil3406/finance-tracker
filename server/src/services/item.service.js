import { dbAll, dbRun } from '../db.js';
import { ApiError } from '../utils/ApiError.js';

const DEFAULT_CATEGORIES = {
  income: { 'Salary': '💼', 'Side Hustle': '💻' },
  expense: { 'Housing': '🏠', 'Food': '🍔', 'Bills': '💳' }
};

export async function getUserData(userId) {
  const incomeRows = await dbAll(
    'SELECT id, type, name, amount, category, created_at FROM items WHERE user_id = ? AND type = ? ORDER BY id',
    [userId, 'income']
  );
  const expenseRows = await dbAll(
    'SELECT id, type, name, amount, category, created_at FROM items WHERE user_id = ? AND type = ? ORDER BY id',
    [userId, 'expense']
  );

  const income = incomeRows.map((r) => ({ id: r.id, name: r.name, amount: Number(r.amount), category: r.category, date: r.created_at }));
  const expense = expenseRows.map((r) => ({ id: r.id, name: r.name, amount: Number(r.amount), category: r.category, date: r.created_at }));

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
      'SELECT id, type, name, amount, category, created_at FROM items WHERE user_id = ? AND type = ? ORDER BY id',
      [userId, 'income']
    );
    const expense2 = await dbAll(
      'SELECT id, type, name, amount, category, created_at FROM items WHERE user_id = ? AND type = ? ORDER BY id',
      [userId, 'expense']
    );

    return {
      data: {
        income: income2.map((r) => ({ id: r.id, name: r.name, amount: Number(r.amount), category: r.category, date: r.created_at })),
        expense: expense2.map((r) => ({ id: r.id, name: r.name, amount: Number(r.amount), category: r.category, date: r.created_at })),
      },
      categories,
    };
  }

  return { data: { income, expense }, categories };
}

export async function createItem(userId, { type, name, amount, category }) {
  if (!['income', 'expense'].includes(type)) {
    throw new ApiError(400, 'type must be income or expense');
  }
  if (!name || typeof amount !== 'number') {
    throw new ApiError(400, 'name and numeric amount are required');
  }

  const result = await dbRun(
    'INSERT INTO items (user_id, type, name, amount, category) VALUES (?, ?, ?, ?, ?)',
    [userId, type, name, amount, category || null]
  );
  return { id: result.lastID };
}

export async function updateItem(userId, id, { type, name, amount, category }) {
  if (!['income', 'expense'].includes(type)) {
    throw new ApiError(400, 'type must be income or expense');
  }
  if (!name || typeof amount !== 'number') {
    throw new ApiError(400, 'name and numeric amount are required');
  }

  const result = await dbRun(
    'UPDATE items SET type = ?, name = ?, amount = ?, category = ?, updated_at = datetime(\'now\') WHERE id = ? AND user_id = ?',
    [type, name, amount, category || null, id, userId]
  );
  if (result.changes === 0) {
    throw new ApiError(404, 'Item not found');
  }
  return { ok: true };
}

export async function deleteItem(userId, id) {
  const result = await dbRun('DELETE FROM items WHERE id = ? AND user_id = ?', [id, userId]);
  if (result.changes === 0) {
    throw new ApiError(404, 'Item not found');
  }
  return { ok: true };
}

export async function deleteCategory(userId, type, categoryName) {
  if (!['income', 'expense'].includes(type)) {
    throw new ApiError(400, 'invalid type');
  }

  const result = await dbRun('DELETE FROM items WHERE user_id = ? AND type = ? AND category = ?', [userId, type, categoryName]);
  return { deleted: result.changes };
}

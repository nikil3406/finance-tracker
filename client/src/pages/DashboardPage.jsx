import React, { useEffect, useMemo, useState } from 'react';
import { authHeaders, fetchJson } from '../api';

const pageStyles = {
  background: 'linear-gradient(to bottom, #040d12, #281515)',
  minHeight: '100vh',
  color: '#f8fafc',
  padding: '24px',
  fontFamily: 'Inter, Arial, sans-serif',
};

const cardStyles = {
  background: '#0f172a',
  borderRadius: 18,
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid rgba(148, 163, 184, 0.12)',
};

const buttonStyles = {
  background: '#2563eb',
  border: 'none',
  color: '#fff',
  padding: '12px 18px',
  borderRadius: 12,
  cursor: 'pointer',
  fontWeight: 600,
};

const dangerButton = {
  ...buttonStyles,
  background: '#dc2626',
};

const inputStyles = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #334155',
  background: '#020617',
  color: '#fff',
  marginTop: 10,
};

const listItemStyles = {
  background: '#020617',
  padding: '14px 18px',
  borderRadius: 14,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
};

function DashboardPage({ token, onLogout }) {
  const [data, setData] = useState({ income: [], expense: [] });
  const [categories, setCategories] = useState({ income: {}, expense: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'income', name: '', amount: '', category: '', newCategory: '', editingId: null });

  const totalIncome = useMemo(
    () => data.income.reduce((sum, item) => sum + Number(item.amount), 0),
    [data.income]
  );

  const totalExpense = useMemo(
    () => data.expense.reduce((sum, item) => sum + Number(item.amount), 0),
    [data.expense]
  );

  const netFlow = totalIncome - totalExpense;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetchJson('/me/data', {
        method: 'GET',
        headers: authHeaders(token),
      });
      setData(response.data);
      setCategories(response.categories);
    } catch (err) {
      if (err.status === 401) {
        onLogout();
      } else {
        setError(err.message || 'Could not load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.amount) {
      setError('Please enter a name and amount.');
      return;
    }

    const numericAmount = Number(form.amount);
    if (Number.isNaN(numericAmount) || numericAmount < 0) {
      setError('Amount must be a positive number.');
      return;
    }

    const category = form.category === '__new__' ? form.newCategory.trim() || null : form.category || null;
    const payload = {
      type: form.type,
      name: form.name.trim(),
      amount: numericAmount,
      category,
    };

    setSaving(true);
    try {
      if (form.editingId) {
        await fetchJson(`/me/data/items/${form.editingId}`, {
          method: 'PUT',
          headers: authHeaders(token),
          body: payload,
        });
      } else {
        await fetchJson('/me/data/items', {
          method: 'POST',
          headers: authHeaders(token),
          body: payload,
        });
      }
      setForm({ type: 'income', name: '', amount: '', category: '', newCategory: '', editingId: null });
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not save item');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (type, item) => {
    setForm({
      type,
      name: item.name,
      amount: item.amount,
      category: item.category || '',
      newCategory: '',
      editingId: item.id,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await fetchJson(`/me/data/items/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not delete item');
    }
  };

  const handleDeleteCategory = async (type, categoryName) => {
    if (!window.confirm(`Delete category \"${categoryName}\" and all items in it?`)) return;
    try {
      await fetchJson(`/me/data/categories/${type}/${encodeURIComponent(categoryName)}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not delete category');
    }
  };

  const currentCategories = categories[form.type] || {};

  return (
    <div style={pageStyles}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Finance Tracker</h1>
          <p style={{ color: '#94a3b8', margin: '6px 0 0 0' }}>Manage income and expenses with your backend.</p>
        </div>
        <button style={buttonStyles} type="button" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div style={cardStyles}>
        <h2>Snapshot</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, padding: 16, borderRadius: 16, background: '#020617' }}>
            <div style={{ color: '#94a3b8' }}>Income</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>₹{totalIncome.toFixed(2)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200, padding: 16, borderRadius: 16, background: '#020617' }}>
            <div style={{ color: '#94a3b8' }}>Expenses</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>₹{totalExpense.toFixed(2)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200, padding: 16, borderRadius: 16, background: '#020617' }}>
            <div style={{ color: '#94a3b8' }}>Net</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: netFlow >= 0 ? '#22c55e' : '#f87171' }}>
              ₹{netFlow.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={cardStyles}>
        <h2>{form.editingId ? 'Edit item' : 'Add item'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ flex: 1 }}>
              Type
              <select
                style={inputStyles}
                value={form.type}
                onChange={(event) => handleFieldChange('type', event.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <label style={{ flex: 1 }}>
              Amount
              <input
                style={inputStyles}
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) => handleFieldChange('amount', event.target.value)}
                placeholder="0.00"
              />
            </label>
          </div>

          <label>
            Name
            <input
              style={inputStyles}
              value={form.name}
              onChange={(event) => handleFieldChange('name', event.target.value)}
              placeholder="Salary, Rent, Groceries..."
            />
          </label>

          <label>
            Category
            <select
              style={inputStyles}
              value={form.category}
              onChange={(event) => handleFieldChange('category', event.target.value)}
            >
              <option value="">Uncategorized</option>
              {Object.keys(currentCategories).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
              <option value="__new__">Create new category</option>
            </select>
          </label>

          {form.category === '__new__' && (
            <label>
              New category
              <input
                style={inputStyles}
                value={form.newCategory}
                onChange={(event) => handleFieldChange('newCategory', event.target.value)}
                placeholder="Enter new category name"
              />
            </label>
          )}

          <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={buttonStyles} type="submit" disabled={saving}>
              {saving ? 'Saving...' : form.editingId ? 'Update item' : 'Add item'}
            </button>
            {form.editingId && (
              <button
                style={dangerButton}
                type="button"
                onClick={() => setForm({ type: 'income', name: '', amount: '', category: '', newCategory: '', editingId: null })}
              >
                Cancel edit
              </button>
            )}
          </div>
          {error && <p style={{ color: '#fecaca', marginTop: 12 }}>{error}</p>}
        </form>
      </div>

      <div style={cardStyles}>
        <h2>Income</h2>
        {loading ? (
          <p>Loading...</p>
        ) : data.income.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No income items yet.</p>
        ) : (
          data.income.map((item) => (
            <div key={item.id} style={listItemStyles}>
              <div>
                <strong>{item.name}</strong>
                <div style={{ color: '#94a3b8', marginTop: 4 }}>{item.category || 'Uncategorized'}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>+₹{Number(item.amount).toFixed(2)}</span>
                <button style={buttonStyles} type="button" onClick={() => handleEdit('income', item)}>
                  Edit
                </button>
                <button style={dangerButton} type="button" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={cardStyles}>
        <h2>Expenses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : data.expense.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No expense items yet.</p>
        ) : (
          data.expense.map((item) => (
            <div key={item.id} style={listItemStyles}>
              <div>
                <strong>{item.name}</strong>
                <div style={{ color: '#94a3b8', marginTop: 4 }}>{item.category || 'Uncategorized'}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>-₹{Number(item.amount).toFixed(2)}</span>
                <button style={buttonStyles} type="button" onClick={() => handleEdit('expense', item)}>
                  Edit
                </button>
                <button style={dangerButton} type="button" onClick={() => handleDelete(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={cardStyles}>
        <h2>Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {Object.entries(categories).map(([categoryType, list]) => (
            <div key={categoryType} style={{ padding: 16, borderRadius: 14, background: '#020617' }}>
              <h3 style={{ marginTop: 0, textTransform: 'capitalize' }}>{categoryType}</h3>
              {Object.keys(list).length === 0 ? (
                <p style={{ color: '#94a3b8' }}>No saved categories.</p>
              ) : (
                Object.keys(list).map((categoryName) => (
                  <div key={categoryName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span>{categoryName}</span>
                    <button
                      style={{ ...dangerButton, padding: '6px 10px', fontSize: 12 }}
                      type="button"
                      onClick={() => handleDeleteCategory(categoryType, categoryName)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

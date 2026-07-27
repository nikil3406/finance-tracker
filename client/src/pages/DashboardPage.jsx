import React, { useEffect, useMemo, useState } from 'react';
import { authHeaders, fetchJson } from '../api';
import DashboardHeader from '../features/dashboard/components/DashboardHeader';
import OverviewTab from '../features/dashboard/components/OverviewTab';
import TransactionsTab from '../features/dashboard/components/TransactionsTab';
import AnalyticsTab from '../features/dashboard/components/AnalyticsTab';
import SettingsTab from '../features/dashboard/components/SettingsTab';
import TransactionModal from '../features/dashboard/components/TransactionModal';
import { RATES, formatValue } from '../utils/currency';

export default function DashboardPage({ token, onLogout }) {
  const [data, setData] = useState({ income: [], expense: [] });
  const [categories, setCategories] = useState({ income: {}, expense: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currency, setCurrency] = useState('₹');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [savingsGoal, setSavingsGoal] = useState({ name: 'Emergency Fund', target: 50000, editing: false });
  const [budgets, setBudgets] = useState({});
  const [form, setForm] = useState({
    type: 'income',
    name: '',
    amount: '',
    category: '',
    newCategory: '',
    editingId: null,
  });

  const totalIncome = useMemo(
    () => (Array.isArray(data?.income) ? data.income.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0) : 0),
    [data]
  );

  const totalExpense = useMemo(
    () => (Array.isArray(data?.expense) ? data.expense.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0) : 0),
    [data]
  );

  const netFlow = totalIncome - totalExpense;

  const combinedItems = useMemo(() => {
    const incomeArr = Array.isArray(data?.income) ? data.income : [];
    const expenseArr = Array.isArray(data?.expense) ? data.expense : [];
    const combined = [
      ...incomeArr.map((i) => ({ ...i, type: 'income' })),
      ...expenseArr.map((e) => ({ ...e, type: 'expense' })),
    ];
    combined.sort((a, b) => {
      const dateA = new Date(String(a.date).replace(' ', 'T'));
      const dateB = new Date(String(b.date).replace(' ', 'T'));
      return (isNaN(dateB.getTime()) ? 0 : dateB.getTime()) - (isNaN(dateA.getTime()) ? 0 : dateA.getTime());
    });
    return combined;
  }, [data]);

  const balanceHistory = useMemo(() => {
    const incomeArr = Array.isArray(data?.income) ? data.income : [];
    const expenseArr = Array.isArray(data?.expense) ? data.expense : [];

    const combined = [
      ...incomeArr.map((i) => ({ ...i, type: 'income' })),
      ...expenseArr.map((e) => ({ ...e, type: 'expense' })),
    ].filter((item) => item && item.date);

    if (combined.length === 0) return [];

    combined.sort((a, b) => {
      const dateA = new Date(String(a.date).replace(' ', 'T'));
      const dateB = new Date(String(b.date).replace(' ', 'T'));
      return (isNaN(dateA.getTime()) ? 0 : dateA.getTime()) - (isNaN(dateB.getTime()) ? 0 : dateB.getTime());
    });

    const groupedByDate = {};
    let currentBalance = 0;

    combined.forEach((item) => {
      const amount = Number(item.amount) || 0;
      currentBalance += item.type === 'income' ? amount : -amount;

      const d = new Date(String(item.date).replace(' ', 'T'));
      if (!isNaN(d.getTime())) {
        const dateKey = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        groupedByDate[dateKey] = formatValue(currentBalance, currency, true);
      }
    });

    return Object.entries(groupedByDate)
      .map(([date, balance]) => ({ date, balance }))
      .slice(-12);
  }, [data, currency]);

  const chartData = useMemo(() => {
    const expenseArr = Array.isArray(data?.expense) ? data.expense : [];
    if (expenseArr.length === 0) return [];

    const rate = RATES[currency] || 1;
    const totals = {};

    expenseArr.forEach((item) => {
      const cat = item.category || 'Uncategorized';
      const val = (Number(item.amount) || 0) * rate;
      if (val > 0) {
        totals[cat] = (totals[cat] || 0) + val;
      }
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [data?.expense, currency]);

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetchJson('/me/data', {
        method: 'GET',
        headers: authHeaders(token),
      });
      setData(response?.data || { income: [], expense: [] });
      setCategories(response?.categories || { income: {}, expense: {} });
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

  const handleOpenAddModal = () => {
    setForm({ type: 'income', name: '', amount: '', category: '', newCategory: '', editingId: null });
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setForm({
      type: item.type,
      name: item.name,
      amount: item.amount,
      category: item.category || '',
      newCategory: '',
      editingId: item.id,
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.amount) {
      setError('Please enter a name and amount.');
      return;
    }

    const numericAmount = Number(form.amount);
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
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      await fetchJson(`/me/data/items/${item.id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    }
  };

  const handleDeleteCategory = async (type, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete category "${categoryName}" and all associated items?`)) return;
    try {
      await fetchJson(`/me/data/categories/${type}/${encodeURIComponent(categoryName)}`, {
        method: 'DELETE',
        headers: authHeaders(token),
      });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Loading your finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currency={currency}
          setCurrency={setCurrency}
          onOpenAddModal={handleOpenAddModal}
          onLogout={onLogout}
        />

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 font-medium flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-xs underline">Dismiss</button>
          </div>
        )}

        <main>
          {activeTab === 'overview' && (
            <OverviewTab
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              netFlow={netFlow}
              currency={currency}
              balanceHistory={balanceHistory}
              chartData={chartData}
              savingsGoal={savingsGoal}
              setSavingsGoal={setSavingsGoal}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab
              combinedItems={combinedItems}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              currency={currency}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              data={data}
              currency={currency}
              budgets={budgets}
              setBudgets={setBudgets}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              categories={categories}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
        </main>
      </div>

      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        form={form}
        onFieldChange={handleFieldChange}
        categories={categories}
        saving={saving}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

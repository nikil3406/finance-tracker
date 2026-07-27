import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { authHeaders, fetchJson } from '../api';
import { RATES } from '../constants/currency';
import { formatValue } from '../utils/formatters';

import Sidebar from '../components/dashboard/Sidebar';
import StatsGrid from '../components/dashboard/StatsGrid';
import WealthChart from '../components/dashboard/WealthChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import SavingsGoalCard from '../components/dashboard/SavingsGoalCard';
import ExpensePieChart from '../components/dashboard/ExpensePieChart';
import SmartInsights from '../components/dashboard/SmartInsights';
import CategoriesView from '../components/dashboard/CategoriesView';
import SettingsView from '../components/dashboard/SettingsView';
import TransactionModal from '../components/dashboard/TransactionModal';

function DashboardPage({ token, onLogout }) {
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
  const [form, setForm] = useState({ type: 'income', name: '', amount: '', category: '', newCategory: '', editingId: null });
  const [userProfile, setUserProfile] = useState({ name: 'User', email: 'user@example.com' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalIncome = useMemo(
    () => (Array.isArray(data?.income) ? data.income.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0) : 0),
    [data]
  );

  const totalExpense = useMemo(
    () => (Array.isArray(data?.expense) ? data.expense.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0) : 0),
    [data]
  );

  const netFlow = totalIncome - totalExpense;

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

  const groupedData = useMemo(() => {
    const res = { income: {}, expense: {} };
    ['income', 'expense'].forEach((type) => {
      if (Array.isArray(data?.[type])) {
        data[type].forEach((item) => {
          const cat = item.category || 'Uncategorized';
          if (!res[type][cat]) res[type][cat] = [];
          res[type][cat].push(item);
        });
      }
    });
    return res;
  }, [data]);

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
    setShowAddModal(true);
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
    if (!window.confirm(`Delete category "${categoryName}" and all items in it?`)) return;
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

  const handleExport = () => {
    const allData = {
      transactions: [...data.income, ...data.expense],
      categories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_data_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="dashboard-main" style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: 'auto' }}
          >
            <span>☰</span>
          </button>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '800' }}>Finance.io</h1>
          <div style={{ width: '40px' }}></div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '800', marginBottom: '4px' }}>Overview</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Track your financial health and expenses</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setForm({ type: 'income', name: '', amount: '', category: '', newCategory: '', editingId: null });
                    setShowAddModal(true);
                  }}
                >
                  <Plus size={20} />
                  Add Transaction
                </button>
              </div>

              {/* Stats Grid */}
              <StatsGrid
                netFlow={netFlow}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                currency={currency}
              />

              {/* Wealth Chart */}
              <WealthChart
                balanceHistory={balanceHistory}
                currency={currency}
              />

              {/* Content Grid */}
              <div className="dashboard-content-grid">
                <RecentTransactions
                  data={data}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  currency={currency}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <SavingsGoalCard
                    netFlow={netFlow}
                    savingsGoal={savingsGoal}
                    setSavingsGoal={setSavingsGoal}
                    currency={currency}
                  />

                  <ExpensePieChart
                    chartData={chartData}
                    currency={currency}
                  />

                  <SmartInsights
                    netFlow={netFlow}
                    currency={currency}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              groupedData={groupedData}
              budgets={budgets}
              setBudgets={setBudgets}
              currency={currency}
              onDeleteCategory={handleDeleteCategory}
              onOpenNewCategoryModal={() => {
                setForm({ type: 'income', name: 'Category Marker', amount: 0, category: '__new__', newCategory: '', editingId: null });
                setShowAddModal(true);
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              currency={currency}
              setCurrency={setCurrency}
              onExportData={handleExport}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        form={form}
        onFieldChange={handleFieldChange}
        categories={categories}
        saving={saving}
        currency={currency}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default DashboardPage;

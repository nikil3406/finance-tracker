import React, { useEffect, useMemo, useState } from 'react';
import { authHeaders, fetchJson } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  LogOut, 
  Trash2, 
  Edit3, 
  LayoutDashboard, 
  PieChart, 
  Settings,
  ChevronRight,
  X,
  Target
} from 'lucide-react';

import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as ReTooltip, 
  Legend as ReLegend,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

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
  const [budgets, setBudgets] = useState({}); // New category-specific budgets
  const [form, setForm] = useState({ type: 'income', name: '', amount: '', category: '', newCategory: '', editingId: null });
  const [userProfile, setUserProfile] = useState({ name: 'User', email: 'user@example.com' });

  // Exchange rates relative to INR (base)
  const RATES = { '₹': 1, '$': 0.012, '€': 0.011, '£': 0.0094 };

  const formatValue = (val, raw = false) => {
    const rate = RATES[currency] || 1;
    const final = val * rate;
    if (raw) return final;
    return final.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalIncome = useMemo(
    () => Array.isArray(data?.income) ? data.income.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0) : 0,
    [data]
  );

  const totalExpense = useMemo(
    () => Array.isArray(data?.expense) ? data.expense.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0) : 0,
    [data]
  );

  const netFlow = totalIncome - totalExpense;

  const balanceHistory = useMemo(() => {
    const incomeArr = Array.isArray(data?.income) ? data.income : [];
    const expenseArr = Array.isArray(data?.expense) ? data.expense : [];
    
    const combined = [
      ...incomeArr.map(i => ({ ...i, type: 'income' })),
      ...expenseArr.map(e => ({ ...e, type: 'expense' }))
    ].filter(item => item && item.date);

    if (combined.length === 0) return [];

    combined.sort((a, b) => {
      const dateA = new Date(String(a.date).replace(' ', 'T'));
      const dateB = new Date(String(b.date).replace(' ', 'T'));
      return (isNaN(dateA.getTime()) ? 0 : dateA.getTime()) - (isNaN(dateB.getTime()) ? 0 : dateB.getTime());
    });

    const groupedByDate = {};
    let currentBalance = 0;

    combined.forEach(item => {
      const amount = Number(item.amount) || 0;
      currentBalance += item.type === 'income' ? amount : -amount;
      
      const d = new Date(String(item.date).replace(' ', 'T'));
      if (!isNaN(d.getTime())) {
        const dateKey = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        groupedByDate[dateKey] = formatValue(currentBalance, true);
      }
    });

    return Object.entries(groupedByDate).map(([date, balance]) => ({
      date,
      balance
    })).slice(-12);
  }, [data, currency]);

  const chartData = useMemo(() => {
    const expenseArr = Array.isArray(data?.expense) ? data.expense : [];
    if (expenseArr.length === 0) return [];
    
    const rate = RATES[currency] || 1;
    const totals = {};
    
    expenseArr.forEach(item => {
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

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

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
      // In a real app, we'd fetch profile from another endpoint
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

  const groupedData = useMemo(() => {
    const res = { income: {}, expense: {} };
    ['income', 'expense'].forEach(type => {
      if (Array.isArray(data?.[type])) {
        data[type].forEach(item => {
          const cat = item.category || 'Uncategorized';
          if (!res[type][cat]) res[type][cat] = [];
          res[type][cat].push(item);
        });
      }
    });
    return res;
  }, [data]);

  const handleExport = () => {
    const allData = {
      transactions: [...data.income, ...data.expense],
      categories,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_data_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  const currentCategories = categories?.[form.type] || {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--glass-border)', padding: '32px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet color="white" size={24} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Finance.io</span>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { icon: LayoutDashboard, label: 'Dashboard', id: 'overview' },
            { icon: PieChart, label: 'Categories', id: 'categories' },
            { icon: Settings, label: 'Settings', id: 'settings' },
          ].map((item) => (
            <div 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px', 
                borderRadius: '12px', 
                background: activeTab === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                marginBottom: '8px',
                fontWeight: activeTab === item.id ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              <item.icon size={20} />
              {item.label}
            </div>
          ))}
        </nav>

        <button 
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '12px 16px', borderRadius: '12px', fontWeight: '600' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '280px', padding: '48px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>Overview</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Track your financial health and expenses</p>
                </div>
                <button className="btn-primary" onClick={() => { setForm({ type: 'income', name: '', amount: '', category: '', newCategory: '', editingId: null }); setShowAddModal(true); }}>
                  <Plus size={20} />
                  Add Transaction
                </button>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {[
                  { label: 'Total Balance', value: `${currency}${formatValue(netFlow)}`, icon: Wallet, color: '#6366f1' },
                  { label: 'Total Income', value: `${currency}${formatValue(totalIncome)}`, icon: TrendingUp, color: 'var(--success)' },
                  { label: 'Total Expenses', value: `${currency}${formatValue(totalExpense)}`, icon: TrendingDown, color: 'var(--danger)' },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card" 
                    style={{ padding: '24px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '500' }}>{stat.label}</span>
                      <div style={{ padding: '8px', background: `${stat.color}15`, color: stat.color, borderRadius: '8px' }}>
                        <stat.icon size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Balance History Chart */}
              <div className="glass-card" style={{ padding: '32px', marginBottom: '40px', minHeight: '400px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px' }}>Wealth Evolution</h3>
                <div style={{ width: '100%', height: '320px', position: 'relative' }}>
                  {(() => {
                    console.log('DEBUG - Raw Data:', data);
                    console.log('DEBUG - Balance History:', balanceHistory);
                    
                    if (balanceHistory && balanceHistory.length > 0) {
                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={balanceHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.30}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              stroke="var(--text-secondary)" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false}
                              dy={10}
                            />
                            <YAxis 
                              stroke="var(--text-secondary)" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              tickFormatter={(val) => `${currency}${formatValue(val)}`}
                            />
                            <ReTooltip 
                              contentStyle={{ background: '#1a1b26', border: '1px solid var(--glass-border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                              itemStyle={{ color: 'var(--accent-primary)', fontWeight: '700' }}
                              formatter={(value) => [`${currency}${formatValue(value)}`, 'Balance']}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="#6366f1" 
                              strokeWidth={4} 
                              fillOpacity={1} 
                              fill="url(#colorBalance)"
                              dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#0f111a' }}
                              activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      );
                    }
                    return (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        No trend data available ({balanceHistory?.length || 0} points found).<br/>
                        Try adding a transaction with a valid date.
                      </div>
                    );
                  })()}
                  {balanceHistory && balanceHistory.length === 1 && (
                    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: 'var(--text-secondary)', fontSize: '0.75rem', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '20px' }}>
                      Add one more transaction to see a trend line
                    </div>
                  )}
                </div>
              </div>

              {/* Transactions Table/List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', alignItems: 'start' }}>
                <div className="glass-card" style={{ padding: '32px', minWidth: '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Transactions</h3>
                    <div style={{ position: 'relative', width: '240px' }}>
                      <input 
                        className="input-field" 
                        style={{ padding: '8px 16px', fontSize: '0.875rem' }} 
                        placeholder="Search transactions..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      />
                    </div>
                  </div>
                  
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading transactions...</div>
                  ) : (() => {
                    const incomeItems = Array.isArray(data?.income) ? data.income.map(i => ({...i, type: 'income'})) : [];
                    const expenseItems = Array.isArray(data?.expense) ? data.expense.map(e => ({...e, type: 'expense'})) : [];
                    const allTransactions = [...incomeItems, ...expenseItems]
                      .sort((a, b) => {
                        const dateA = new Date(String(a.date).replace(' ', 'T'));
                        const dateB = new Date(String(b.date).replace(' ', 'T'));
                        return (isNaN(dateB.getTime()) ? 0 : dateB.getTime()) - (isNaN(dateA.getTime()) ? 0 : dateA.getTime());
                      })
                      .filter(item => 
                        String(item.name).toLowerCase().includes(searchTerm.toLowerCase()) || 
                        String(item.category || '').toLowerCase().includes(searchTerm.toLowerCase())
                      );

                    if (allTransactions.length === 0) {
                      return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No transactions found</div>;
                    }

                    const itemsPerPage = 8;
                    const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedTransactions = allTransactions.slice(startIndex, startIndex + itemsPerPage);

                    return (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
                          {paginatedTransactions.map((item, i) => (
                            <motion.div 
                              key={item.id || i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                padding: '16px', 
                                background: 'rgba(255,255,255,0.02)', 
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.03)',
                                overflow: 'hidden'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '0' }}>
                                <div style={{ 
                                  flexShrink: 0,
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '10px', 
                                  background: item.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  color: item.type === 'income' ? 'var(--success)' : 'var(--danger)'
                                }}>
                                  {item.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                </div>
                                <div style={{ minWidth: '0' }}>
                                  <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {String(item.date).split(' ')[0]} • {item.category || 'Uncategorized'}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: item.type === 'income' ? 'var(--success)' : 'white' }}>
                                  {item.type === 'income' ? '+' : '-'}{currency}{formatValue(Number(item.amount) || 0)}
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button onClick={() => handleEdit(item.type, item)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}><Edit3 size={14} /></button>
                                  <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} /></button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                            <button 
                              disabled={currentPage === 1}
                              onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="input-field"
                              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.75rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                            >
                              Prev
                            </button>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                              {currentPage} / {totalPages}
                            </span>
                            <button 
                              disabled={currentPage === totalPages}
                              onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="input-field"
                              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.75rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Savings Goal Progress */}
                  <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--accent-primary)', opacity: 0.03, borderRadius: '0 0 0 100%' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={18} color="var(--accent-primary)" />
                        Savings Goal
                      </h3>
                      <button 
                        onClick={() => setSavingsGoal({...savingsGoal, editing: !savingsGoal.editing})}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        {savingsGoal.editing ? 'Done' : 'Edit'}
                      </button>
                    </div>

                    {savingsGoal.editing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 10 }}>
                        <input 
                          className="input-field" 
                          style={{ fontSize: '0.875rem', padding: '8px 12px' }} 
                          value={savingsGoal.name} 
                          onChange={(e) => setSavingsGoal({...savingsGoal, name: e.target.value})}
                          placeholder="Goal Name"
                          autoFocus
                        />
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{currency}</span>
                          <input 
                            className="input-field" 
                            type="number"
                            style={{ fontSize: '0.875rem', padding: '8px 12px 8px 32px' }} 
                            value={savingsGoal.target || ''} 
                            onChange={(e) => setSavingsGoal({...savingsGoal, target: e.target.value === '' ? 0 : Number(e.target.value)})}
                            placeholder="Target Amount"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                            <span style={{ fontWeight: '500' }}>{savingsGoal.name}</span>
                            <span style={{ fontWeight: '800', color: 'var(--accent-primary)' }}>{Math.min(100, Math.max(0, Math.floor((netFlow / (savingsGoal.target || 1)) * 100)))}%</span>
                          </div>
                          <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.max(0, (netFlow / (savingsGoal.target || 1)) * 100))}%` }}
                              style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '10px' }} 
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {currency}{formatValue(netFlow)} / {currency}{formatValue(savingsGoal.target)}
                          </div>
                          {netFlow >= savingsGoal.target ? (
                            <div style={{ padding: '4px 8px', background: 'var(--success)20', color: 'var(--success)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>Goal Achieved! 🎉</div>
                          ) : (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                              {currency}{formatValue(Math.max(0, savingsGoal.target - netFlow))} more!
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="glass-card" style={{ padding: '24px', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Expense Breakdown</h3>
                    {chartData.length === 0 ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        No data to display
                      </div>
                    ) : (
                      <div style={{ flex: 1, width: '100%' }}>
                        <ResponsiveContainer width="100%" height={320}>
                          <RePieChart>
                            <Pie
                              data={chartData}
                              innerRadius={60}
                              outerRadius={85}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ReTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const item = payload[0].payload;
                                  return (
                                    <div style={{ background: '#1a1b26', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                      <p style={{ margin: 0, fontWeight: '700', color: 'white', fontSize: '0.875rem' }}>{String(item.name).length > 20 ? String(item.name).substring(0, 20) + '...' : item.name}</p>
                                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cat: {item.category}</p>
                                      <p style={{ margin: '4px 0 0', fontWeight: '700', color: 'var(--accent-primary)', fontSize: '0.875rem' }}>{currency}{formatValue(item.value / (RATES[currency] || 1))}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <ReLegend 
                              verticalAlign="bottom" 
                              height={36} 
                              iconType="circle" 
                              formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{value.length > 12 ? value.substring(0, 12) + '...' : value}</span>}
                            />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                    borderRadius: '24px', 
                    padding: '24px', 
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.2 }}>
                      <PieChart size={120} />
                    </div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '8px' }}>Smart Insights</h4>
                      <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.5 }}>
                        {netFlow > 0 ? `You're doing great! You saved ${currency}${formatValue(netFlow)} this month.` : `You spent ${currency}${formatValue(Math.abs(netFlow))} more than you earned. Review your categories!`}
                      </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>Categories</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Manage and organize your transaction labels</p>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={() => { setForm({ type: 'income', name: 'Category Marker', amount: 0, category: '__new__', newCategory: '', editingId: null }); setShowAddModal(true); }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
                >
                  <Plus size={20} />
                  New Category
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {['income', 'expense'].map(type => (
                  <div key={type} className="glass-card" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', background: type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '10px' }}>
                        {type === 'income' ? <TrendingUp size={20} color="var(--success)" /> : <TrendingDown size={20} color="var(--danger)" />}
                      </div>
                      {type} Categories
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.keys(groupedData[type]).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                          No categories found
                        </div>
                      ) : (
                        Object.entries(groupedData[type]).map(([cat, items]) => {
                          const catTotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
                          const budget = budgets[cat] || 0;
                          const overBudget = type === 'expense' && budget > 0 && catTotal > budget;
                          const progress = budget > 0 ? Math.min(100, (catTotal / budget) * 100) : 0;

                          return (
                            <motion.div 
                              key={cat} 
                              whileHover={{ y: -4 }}
                              style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                padding: '20px', 
                                background: 'rgba(255,255,255,0.02)', 
                                borderRadius: '20px',
                                border: `1px solid ${overBudget ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                  <div style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '4px' }}>{cat}</div>
                                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {items.length} transactions
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {cat !== 'Uncategorized' && (
                                    <button 
                                      onClick={() => handleDeleteCategory(type, cat)}
                                      style={{ 
                                        width: '32px', 
                                        height: '32px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        background: 'rgba(239, 68, 68, 0.1)', 
                                        border: 'none', 
                                        color: 'var(--danger)', 
                                        borderRadius: '8px', 
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Spend: {currency}{formatValue(catTotal)}</span>
                                  {budget > 0 && <span style={{ color: overBudget ? 'var(--danger)' : 'var(--text-secondary)' }}>Limit: {currency}{formatValue(budget)}</span>}
                                </div>
                                {budget > 0 && (
                                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progress}%` }}
                                      style={{ height: '100%', background: overBudget ? 'var(--danger)' : 'var(--accent-primary)', borderRadius: '10px' }} 
                                    />
                                  </div>
                                )}
                              </div>

                              {type === 'expense' && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <input 
                                    type="number"
                                    placeholder="Set Budget"
                                    className="input-field"
                                    style={{ padding: '6px 10px', fontSize: '0.75rem', flex: 1 }}
                                    value={budgets[cat] || ''}
                                    onChange={(e) => setBudgets({...budgets, [cat]: Number(e.target.value)})}
                                  />
                                </div>
                              )}
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '24px' }}>Account Settings</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700' }}>
                      {userProfile.name[0]}
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>{userProfile.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{userProfile.email}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
                      <input 
                        className="input-field" 
                        value={userProfile.name} 
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      />
                    </div>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Currency Display</label>
                      <select 
                        className="input-field" 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={{ appearance: 'none', background: 'rgba(255,255,255,0.05)' }}
                      >
                        <option value="₹" style={{ background: '#1a1b26' }}>Indian Rupee (₹)</option>
                        <option value="$" style={{ background: '#1a1b26' }}>US Dollar ($)</option>
                        <option value="€" style={{ background: '#1a1b26' }}>Euro (€)</option>
                        <option value="£" style={{ background: '#1a1b26' }}>British Pound (£)</option>
                      </select>
                    </div>
                    <button className="btn-primary" style={{ width: 'fit-content' }}>Update Profile</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Settings size={20} /> Data Management
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
                      Download all your transaction data as a JSON file for backup or external analysis.
                    </p>
                    <button className="btn-primary" onClick={handleExport} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                      Export Data (.json)
                    </button>
                  </div>

                  <div className="glass-card" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--danger)' }}>Danger Zone</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button style={{ padding: '12px', borderRadius: '12px', border: 'none', color: 'white', background: 'var(--danger)', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '480px', padding: '32px', position: 'relative' }}
            >
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ position: 'absolute', right: '24px', top: '24px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>{form.editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  {['income', 'expense'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleFieldChange('type', t)}
                      style={{ 
                        flex: 1, 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--glass-border)',
                        background: form.type === t ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                        color: 'white',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="input-group">
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Transaction Name (e.g. Salary, Rent)"
                  />
                </div>

                <div className="input-group">
                  <input
                    className="input-field"
                    type="number"
                    value={form.amount}
                    onChange={(e) => handleFieldChange('amount', e.target.value)}
                    placeholder={`Amount (${currency})`}
                  />
                </div>

                <div className="input-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Category</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="input-field"
                      value={form.category}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                      style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <option value="" style={{ background: '#1a1b26' }}>Select Category</option>
                      {Object.keys(currentCategories).map(c => <option key={c} value={c} style={{ background: '#1a1b26' }}>{c}</option>)}
                      <option value="__new__" style={{ background: '#1a1b26' }}>+ Create New Category</option>
                    </select>
                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                      <ChevronRight size={18} style={{ transform: 'rotate(90deg)' }} />
                    </div>
                  </div>
                </div>

                {form.category === '__new__' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="input-group"
                  >
                    <input
                      className="input-field"
                      value={form.newCategory}
                      onChange={(e) => handleFieldChange('newCategory', e.target.value)}
                      placeholder="New Category Name"
                      autoFocus
                    />
                  </motion.div>
                )}

                <button className="btn-primary" style={{ width: '100%', marginTop: '12px' }} type="submit" disabled={saving}>
                  {saving ? 'Saving...' : form.editingId ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardPage;

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { formatValue } from '../../utils/formatters';

export default function StatsGrid({ netFlow, totalIncome, totalExpense, currency }) {
  const stats = [
    { label: 'Total Balance', value: `${currency}${formatValue(netFlow, currency)}`, icon: Wallet, color: '#6366f1' },
    { label: 'Total Income', value: `${currency}${formatValue(totalIncome, currency)}`, icon: TrendingUp, color: 'var(--success)' },
    { label: 'Total Expenses', value: `${currency}${formatValue(totalExpense, currency)}`, icon: TrendingDown, color: 'var(--danger)' },
  ];

  return (
    <div className="dashboard-stats-grid">
      {stats.map((stat, i) => (
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
  );
}

import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, Edit3 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import StatCard from '../../../components/ui/StatCard';
import { formatValue } from '../../../utils/currency';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function OverviewTab({
  totalIncome,
  totalExpense,
  netFlow,
  currency,
  balanceHistory,
  chartData,
  savingsGoal,
  setSavingsGoal
}) {
  return (
    <div className="tab-content space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Income"
          amount={formatValue(totalIncome, currency)}
          currency={currency}
          icon={TrendingUp}
          colorClass="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          title="Total Expenses"
          amount={formatValue(totalExpense, currency)}
          currency={currency}
          icon={TrendingDown}
          colorClass="bg-rose-500/10 text-rose-500"
        />
        <StatCard
          title="Net Balance"
          amount={formatValue(netFlow, currency)}
          currency={currency}
          icon={Wallet}
          colorClass="bg-indigo-500/10 text-indigo-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Balance Trend */}
        <div className="card lg:col-span-2">
          <h3 className="card-title mb-4">Balance Growth</h3>
          <div className="h-72 w-full">
            {balanceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceHistory}>
                  <defs>
                    <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#balanceGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No transactions recorded yet</div>
            )}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="card">
          <h3 className="card-title mb-4">Expense Breakdown</h3>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No expense records found</div>
            )}
          </div>
        </div>
      </div>

      {/* Savings Goal Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            <h3 className="card-title">{savingsGoal.name}</h3>
          </div>
          <button
            onClick={() => setSavingsGoal(prev => ({ ...prev, editing: !prev.editing }))}
            className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
          >
            <Edit3 className="h-3 w-3" />
            {savingsGoal.editing ? 'Save' : 'Edit Goal'}
          </button>
        </div>

        {savingsGoal.editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">Goal Name</label>
              <input
                type="text"
                value={savingsGoal.name}
                onChange={e => setSavingsGoal(prev => ({ ...prev, name: e.target.value }))}
                className="form-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Target Amount ({currency})</label>
              <input
                type="number"
                value={savingsGoal.target}
                onChange={e => setSavingsGoal(prev => ({ ...prev, target: Number(e.target.value) }))}
                className="form-input mt-1"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>Progress</span>
              <span>
                {currency} {formatValue(Math.max(0, netFlow), currency)} / {currency} {formatValue(savingsGoal.target, currency)}
              </span>
            </div>
            <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, (netFlow / (savingsGoal.target || 1)) * 100))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

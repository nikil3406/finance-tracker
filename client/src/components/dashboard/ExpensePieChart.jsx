import React from 'react';
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
} from 'recharts';
import { RATES } from '../../constants/currency';
import { formatValue } from '../../utils/formatters';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function ExpensePieChart({ chartData, currency }) {
  return (
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
                        <p style={{ margin: 0, fontWeight: '700', color: 'white', fontSize: '0.875rem' }}>
                          {String(item.name).length > 20 ? String(item.name).substring(0, 20) + '...' : item.name}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Cat: {item.category || item.name}
                        </p>
                        <p style={{ margin: '4px 0 0', fontWeight: '700', color: 'var(--accent-primary)', fontSize: '0.875rem' }}>
                          {currency}{formatValue(item.value / (RATES[currency] || 1), currency)}
                        </p>
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
                formatter={(value) => (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                    {value.length > 12 ? value.substring(0, 12) + '...' : value}
                  </span>
                )}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

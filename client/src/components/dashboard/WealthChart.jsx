import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from 'recharts';
import { formatValue } from '../../utils/formatters';

export default function WealthChart({ balanceHistory, currency }) {
  return (
    <div className="glass-card" style={{ padding: '32px', marginBottom: '40px', minHeight: '400px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px' }}>Wealth Evolution</h3>
      <div style={{ width: '100%', height: '320px', position: 'relative' }}>
        {balanceHistory && balanceHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                tickFormatter={(val) => `${currency}${formatValue(val, currency)}`}
              />
              <ReTooltip
                contentStyle={{
                  background: '#1a1b26',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
                itemStyle={{ color: 'var(--accent-primary)', fontWeight: '700' }}
                formatter={(value) => [`${currency}${formatValue(value, currency)}`, 'Balance']}
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
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}
          >
            No trend data available ({balanceHistory?.length || 0} points found).
            <br />
            Try adding a transaction with a valid date.
          </div>
        )}

        {balanceHistory && balanceHistory.length === 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              background: 'rgba(0,0,0,0.5)',
              padding: '4px 12px',
              borderRadius: '20px',
            }}
          >
            Add one more transaction to see a trend line
          </div>
        )}
      </div>
    </div>
  );
}

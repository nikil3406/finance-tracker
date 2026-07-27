import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { formatValue } from '../../utils/formatters';

export default function SavingsGoalCard({ netFlow, savingsGoal, setSavingsGoal, currency }) {
  const percentage = Math.min(100, Math.max(0, Math.floor((netFlow / (savingsGoal.target || 1)) * 100)));

  return (
    <div className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'var(--accent-primary)',
          opacity: 0.03,
          borderRadius: '0 0 0 100%',
        }}
      ></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="var(--accent-primary)" />
          Savings Goal
        </h3>
        <button
          onClick={() => setSavingsGoal({ ...savingsGoal, editing: !savingsGoal.editing })}
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
            onChange={(e) => setSavingsGoal({ ...savingsGoal, name: e.target.value })}
            placeholder="Goal Name"
            autoFocus
          />
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {currency}
            </span>
            <input
              className="input-field"
              type="number"
              style={{ fontSize: '0.875rem', padding: '8px 12px 8px 32px' }}
              value={savingsGoal.target || ''}
              onChange={(e) => setSavingsGoal({ ...savingsGoal, target: e.target.value === '' ? 0 : Number(e.target.value) })}
              placeholder="Target Amount"
            />
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: '500' }}>{savingsGoal.name}</span>
              <span style={{ fontWeight: '800', color: 'var(--accent-primary)' }}>{percentage}%</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '10px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {currency}{formatValue(netFlow, currency)} / {currency}{formatValue(savingsGoal.target, currency)}
            </div>
            {netFlow >= savingsGoal.target ? (
              <div style={{ padding: '4px 8px', background: 'var(--success)20', color: 'var(--success)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                Goal Achieved! 🎉
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {currency}{formatValue(Math.max(0, savingsGoal.target - netFlow), currency)} more!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

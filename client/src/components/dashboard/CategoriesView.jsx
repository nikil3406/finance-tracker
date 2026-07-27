import React from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { formatValue } from '../../utils/formatters';

export default function CategoriesView({
  groupedData,
  budgets,
  setBudgets,
  currency,
  onDeleteCategory,
  onOpenNewCategoryModal,
}) {
  return (
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
          onClick={onOpenNewCategoryModal}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
        >
          <Plus size={20} />
          New Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {['income', 'expense'].map((type) => (
          <div key={type} className="glass-card" style={{ padding: '32px' }}>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '24px',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  padding: '8px',
                  background: type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '10px',
                }}
              >
                {type === 'income' ? <TrendingUp size={20} color="var(--success)" /> : <TrendingDown size={20} color="var(--danger)" />}
              </div>
              {type} Categories
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(groupedData[type]).length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px',
                    border: '2px dashed rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    color: 'var(--text-secondary)',
                  }}
                >
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
                        position: 'relative',
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
                              onClick={() => onDeleteCategory(type, cat)}
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
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Spend: {currency}{formatValue(catTotal, currency)}
                          </span>
                          {budget > 0 && (
                            <span style={{ color: overBudget ? 'var(--danger)' : 'var(--text-secondary)' }}>
                              Limit: {currency}{formatValue(budget, currency)}
                            </span>
                          )}
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
                            onChange={(e) => setBudgets({ ...budgets, [cat]: Number(e.target.value) })}
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
  );
}

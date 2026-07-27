import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

export default function TransactionModal({
  isOpen,
  onClose,
  form,
  onFieldChange,
  categories,
  saving,
  currency,
  onSubmit,
}) {
  const currentCategories = categories?.[form.type] || {};

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '480px', padding: '32px', position: 'relative' }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                right: '24px',
                top: '24px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>
              {form.editingId ? 'Edit Transaction' : 'New Transaction'}
            </h2>

            <form onSubmit={onSubmit}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {['income', 'expense'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onFieldChange('type', t)}
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
                      transition: 'all 0.2s',
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
                  onChange={(e) => onFieldChange('name', e.target.value)}
                  placeholder="Transaction Name (e.g. Salary, Rent)"
                />
              </div>

              <div className="input-group">
                <input
                  className="input-field"
                  type="number"
                  value={form.amount}
                  onChange={(e) => onFieldChange('amount', e.target.value)}
                  placeholder={`Amount (${currency})`}
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={(e) => onFieldChange('category', e.target.value)}
                    style={{ appearance: 'none', background: 'rgba(255, 255, 255, 0.05)' }}
                  >
                    <option value="" style={{ background: '#1a1b26' }}>
                      Select Category
                    </option>
                    {Object.keys(currentCategories).map((c) => (
                      <option key={c} value={c} style={{ background: '#1a1b26' }}>
                        {c}
                      </option>
                    ))}
                    <option value="__new__" style={{ background: '#1a1b26' }}>
                      + Create New Category
                    </option>
                  </select>
                  <div
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <ChevronRight size={18} style={{ transform: 'rotate(90deg)' }} />
                  </div>
                </div>
              </div>

              {form.category === '__new__' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="input-group">
                  <input
                    className="input-field"
                    value={form.newCategory}
                    onChange={(e) => onFieldChange('newCategory', e.target.value)}
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
  );
}

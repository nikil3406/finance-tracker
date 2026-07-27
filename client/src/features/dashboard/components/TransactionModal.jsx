import React from 'react';
import Modal from '../../../components/ui/Modal';

export default function TransactionModal({
  isOpen,
  onClose,
  form,
  onFieldChange,
  categories,
  saving,
  error,
  onSubmit
}) {
  const isEditing = Boolean(form.editingId);
  const availableCategories = Object.keys(categories?.[form.type] || {});

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Add New Transaction'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-500 font-medium">
            {error}
          </div>
        )}

        {/* Transaction Type */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => onFieldChange('type', 'income')}
              className={`py-2 text-sm font-semibold rounded-lg border transition-all ${
                form.type === 'income'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => onFieldChange('type', 'expense')}
              className={`py-2 text-sm font-semibold rounded-lg border transition-all ${
                form.type === 'expense'
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Item Name */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name / Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Monthly Salary, Grocery Shopping"
            value={form.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            className="form-input mt-1"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</label>
          <input
            type="number"
            required
            step="any"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => onFieldChange('amount', e.target.value)}
            className="form-input mt-1"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
          <select
            value={form.category}
            onChange={(e) => onFieldChange('category', e.target.value)}
            className="form-input mt-1"
          >
            <option value="">Select Category (Optional)</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {categories[form.type][cat]} {cat}
              </option>
            ))}
            <option value="__new__">+ Create New Category</option>
          </select>
        </div>

        {/* New Category Input */}
        {form.category === '__new__' && (
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Category Name</label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Freelance"
              value={form.newCategory}
              onChange={(e) => onFieldChange('newCategory', e.target.value)}
              className="form-input mt-1"
            />
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

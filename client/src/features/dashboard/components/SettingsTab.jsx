import React from 'react';
import { Trash2 } from 'lucide-react';

export default function SettingsTab({ categories, onDeleteCategory }) {
  return (
    <div className="tab-content space-y-6">
      <div className="card">
        <h3 className="card-title mb-4">Manage Custom Categories</h3>
        <p className="text-xs text-slate-400 mb-6">
          Deleting a category will remove all associated transactions from your records.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income Categories */}
          <div>
            <h4 className="font-semibold text-emerald-500 mb-3 text-sm">Income Categories</h4>
            <div className="space-y-2">
              {Object.keys(categories?.income || {}).map((catName) => (
                <div
                  key={`income-${catName}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center space-x-2">
                    <span>{categories.income[catName]}</span>
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{catName}</span>
                  </div>
                  <button
                    onClick={() => onDeleteCategory('income', catName)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <h4 className="font-semibold text-rose-500 mb-3 text-sm">Expense Categories</h4>
            <div className="space-y-2">
              {Object.keys(categories?.expense || {}).map((catName) => (
                <div
                  key={`expense-${catName}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center space-x-2">
                    <span>{categories.expense[catName]}</span>
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{catName}</span>
                  </div>
                  <button
                    onClick={() => onDeleteCategory('expense', catName)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

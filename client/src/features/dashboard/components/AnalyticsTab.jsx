import React from 'react';
import { formatValue } from '../../../utils/currency';

export default function AnalyticsTab({ data, currency, budgets, setBudgets }) {
  const expenseArr = Array.isArray(data?.expense) ? data.expense : [];
  
  // Calculate spending per category
  const categorySpending = {};
  expenseArr.forEach(item => {
    const cat = item.category || 'Uncategorized';
    categorySpending[cat] = (categorySpending[cat] || 0) + Number(item.amount);
  });

  const categories = Object.keys(categorySpending);

  const handleBudgetChange = (cat, val) => {
    setBudgets(prev => ({
      ...prev,
      [cat]: Number(val) || 0
    }));
  };

  return (
    <div className="tab-content space-y-6">
      <div className="card">
        <h3 className="card-title mb-2">Category Budget Tracker</h3>
        <p className="text-xs text-slate-400 mb-6">
          Set monthly spending limits for each category and track your limit adherence.
        </p>

        {categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map(cat => {
              const spent = categorySpending[cat] || 0;
              const limit = budgets[cat] || 10000; // default 10,000 budget target if unset
              const percentage = Math.min(100, Math.round((spent / limit) * 100));

              return (
                <div key={cat} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{cat}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs">
                        Spent: <span className="font-bold text-slate-800 dark:text-slate-100">{currency} {formatValue(spent, currency)}</span>
                      </span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-400">Target:</span>
                        <input
                          type="number"
                          value={budgets[cat] ?? 10000}
                          onChange={(e) => handleBudgetChange(cat, e.target.value)}
                          className="w-24 px-2 py-0.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        percentage > 90
                          ? 'bg-rose-500'
                          : percentage > 70
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">
            No expenses found. Add some expense items to set category budgets.
          </div>
        )}
      </div>
    </div>
  );
}

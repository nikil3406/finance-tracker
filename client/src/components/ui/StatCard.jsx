import React from 'react';

export default function StatCard({ title, amount, currency, icon: Icon, trend, colorClass }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="stat-title">{title}</span>
        <div className={`icon-wrapper ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="stat-value">
        {currency} {amount}
      </div>
      {trend && <span className="stat-trend">{trend}</span>}
    </div>
  );
}

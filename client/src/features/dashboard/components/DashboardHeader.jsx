import React from 'react';
import { LayoutDashboard, PieChart, Settings, Plus, LogOut, Wallet } from 'lucide-react';

export default function DashboardHeader({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenAddModal,
  onLogout
}) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-badge">
          <Wallet className="h-6 w-6 text-indigo-500" />
        </div>
        <h1 className="header-title">FinanceTracker</h1>
      </div>

      <nav className="nav-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${isActive ? 'tab-btn-active' : ''}`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="header-right">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="currency-select"
        >
          <option value="₹">₹ INR</option>
          <option value="$">$ USD</option>
          <option value="€">€ EUR</option>
          <option value="£">£ GBP</option>
        </select>

        <button onClick={onOpenAddModal} className="btn-primary">
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>

        <button onClick={onLogout} className="btn-logout" title="Logout">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

import React from 'react';
import { Wallet, LayoutDashboard, PieChart, Settings, LogOut } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'overview' },
    { icon: PieChart, label: 'Categories', id: 'categories' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`dashboard-sidebar ${sidebarOpen ? 'active' : ''}`}
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--glass-border)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet color="white" size={24} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Finance.io</span>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: activeTab === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                marginBottom: '8px',
                fontWeight: activeTab === item.id ? '600' : '400',
                transition: 'all 0.2s',
              }}
            >
              <item.icon size={20} />
              {item.label}
            </div>
          ))}
        </nav>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--danger)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: '12px',
            fontWeight: '600',
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );
}

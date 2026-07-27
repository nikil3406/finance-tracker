import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { CURRENCIES } from '../../constants/currency';

export default function SettingsView({
  userProfile,
  setUserProfile,
  currency,
  setCurrency,
  onExportData,
}) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '24px' }}>Account Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--accent-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '700',
              }}
            >
              {userProfile.name[0]}
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{userProfile.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{userProfile.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <input
                className="input-field"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Currency Display
              </label>
              <select
                className="input-field"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ appearance: 'none', background: 'rgba(255,255,255,0.05)' }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.symbol} value={c.symbol} style={{ background: '#1a1b26' }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-primary" style={{ width: 'fit-content' }}>
              Update Profile
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={20} /> Data Management
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Download all your transaction data as a JSON file for backup or external analysis.
            </p>
            <button
              className="btn-primary"
              onClick={onExportData}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
            >
              Export Data (.json)
            </button>
          </div>

          <div
            className="glass-card"
            style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <h3 style={{ marginBottom: '16px', color: 'var(--danger)' }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                color: 'white',
                background: 'var(--danger)',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

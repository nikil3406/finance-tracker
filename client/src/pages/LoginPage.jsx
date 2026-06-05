import React, { useState } from 'react';
import { fetchJson } from '../api';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

function LoginPage({ onRegister, onSuccess }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!usernameOrEmail.trim() || !password) {
      setError('Please enter your email/username and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchJson('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { usernameOrEmail: usernameOrEmail.trim(), password },
      });

      onSuccess(data.token);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #1e1b4b, #05060b)', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '400px', padding: 'clamp(20px, 8vw, 40px)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}
          >
            <LogIn size={32} color="white" />
          </motion.div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '48px' }}
              type="text"
              value={usernameOrEmail}
              onChange={(event) => setUsernameOrEmail(event.target.value)}
              placeholder="Email or Username"
            />
          </div>

          <div className="input-group">
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '48px' }}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ color: 'var(--danger)', marginTop: '16px', fontSize: '0.875rem', textAlign: 'center', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            {error}
          </motion.div>
        )}

        <div 
          onClick={onRegister}
          style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'clamp(0.8rem, 3vw, 0.875rem)', transition: 'color 0.3s' }}
          onMouseOver={(e) => e.target.style.color = 'white'}
          onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          Don’t have an account? <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Register now</span>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;

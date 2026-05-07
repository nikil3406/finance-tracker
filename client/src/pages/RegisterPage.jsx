import React, { useState } from 'react';
import { fetchJson } from '../api';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

function RegisterPage({ onLogin, onSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchJson('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { username: username.trim(), email: email.trim(), password },
      });

      onSuccess(data.token);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at bottom left, #1e1b4b, #05060b)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '440px', padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}
          >
            <UserPlus size={32} color="white" />
          </motion.div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Join us to start tracking your finances</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '48px' }}
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
            />
          </div>

          <div className="input-group">
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '48px' }}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
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
            {loading ? 'Creating account...' : (
              <>
                Get Started <ArrowRight size={18} />
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
          onClick={onLogin}
          style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem', transition: 'color 0.3s' }}
          onMouseOver={(e) => e.target.style.color = 'white'}
          onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          Already have an account? <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign In</span>
        </div>
      </motion.div>
    </div>
  );
}

export default RegisterPage;

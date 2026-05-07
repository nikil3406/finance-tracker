import React, { useState } from 'react';
import { fetchJson } from '../api';

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #1f1c2c, #928dab)' },
  card: { width: 360, padding: 24, borderRadius: 16, background: '#12131b', color: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.2)' },
  heading: { marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', margin: '10px 0', padding: '12px 14px', borderRadius: 10, border: '1px solid #444', background: '#1b1d29', color: '#fff', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none', background: '#5a67ff', color: '#fff', cursor: 'pointer', fontWeight: 600, boxSizing: 'border-box' },
  link: { marginTop: 16, textAlign: 'center', color: '#a2b0ff', cursor: 'pointer' },
  error: { color: '#ff6b6b', marginTop: 10 },
};

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
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Expense Tracker</h2>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            value={usernameOrEmail}
            onChange={(event) => setUsernameOrEmail(event.target.value)}
            placeholder="Email or Username"
          />
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.link} onClick={onRegister}>
          Don’t have an account? Register now.
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

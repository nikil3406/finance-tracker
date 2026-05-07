import React, { useState } from 'react';
import { fetchJson } from '../api';

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #0f172a, #334155)' },
  card: { width: 360, padding: 24, borderRadius: 16, background: '#0f172a', color: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.25)' },
  heading: { marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', margin: '10px 0', padding: '12px 14px', borderRadius: 10, border: '1px solid #334155', background: '#111827', color: '#fff', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 600, boxSizing: 'border-box' },
  link: { marginTop: 16, textAlign: 'center', color: '#93c5fd', cursor: 'pointer' },
  error: { color: '#fecaca', marginTop: 10 },
};

function RegisterPage({ onLogin, onSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (password !== password2) {
      setError('Passwords do not match.');
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
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
          />
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
          />
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
          <input
            style={styles.input}
            type="password"
            value={password2}
            onChange={(event) => setPassword2(event.target.value)}
            placeholder="Confirm Password"
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.link} onClick={onLogin}>
          Already have an account? Sign in.
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

import React, { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [page, setPage] = useState('login');
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      setPage('dashboard');
    } else if (page === 'dashboard') {
      setPage('login');
    }
  }, [page, token]);

  const handleLogin = (newToken) => {
    sessionStorage.setItem('token', newToken);
    setToken(newToken);
    setPage('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setPage('login');
  };

  return (
    <div>
      {page === 'login' && (
        <LoginPage onRegister={() => setPage('register')} onSuccess={handleLogin} />
      )}
      {page === 'register' && (
        <RegisterPage onLogin={() => setPage('login')} onSuccess={handleLogin} />
      )}
      {page === 'dashboard' && token && <DashboardPage token={token} onLogout={handleLogout} />}
    </div>
  );
}

export default App;

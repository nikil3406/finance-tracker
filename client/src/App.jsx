import React, { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { AnimatePresence, motion } from 'framer-motion';

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

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <AnimatePresence mode="wait">
      {page === 'login' && (
        <motion.div
          key="login"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <LoginPage onRegister={() => setPage('register')} onSuccess={handleLogin} />
        </motion.div>
      )}
      {page === 'register' && (
        <motion.div
          key="register"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <RegisterPage onLogin={() => setPage('login')} onSuccess={handleLogin} />
        </motion.div>
      )}
      {page === 'dashboard' && token && (
        <motion.div
          key="dashboard"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <DashboardPage token={token} onLogout={handleLogout} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;

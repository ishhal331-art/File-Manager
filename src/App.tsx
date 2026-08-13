import React, { useState, useEffect } from 'react';
import { User } from './types';
import { api } from './lib/api';
import { LoginPage } from './components/auth/LoginPage';
import { ClientDashboard } from './components/dashboard/ClientDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    checkSession();

    // Prevent browser back button from closing application or leaving site
    try {
      window.history.pushState({ app: 'portal_home' }, '', window.location.href);
    } catch (err) {
      console.warn('History API initialized:', err);
    }

    const handlePopState = () => {
      // Dispatch custom backbutton event so open modals or sub-views close smoothly
      const backEvt = new CustomEvent('app:backbutton', { cancelable: true });
      window.dispatchEvent(backEvt);

      // Re-push history entry so the browser stays within the website home page
      try {
        window.history.pushState({ app: 'portal_home' }, '', window.location.href);
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const checkSession = async () => {
    try {
      const res = await api.getCurrentUser();
      setCurrentUser(res.user);
    } catch (err) {
      console.log('No active session found or token expired.');
      setCurrentUser(null);
    } finally {
      setInitializing(false);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE7FA] via-[#E2DCF7] to-[#D5CBF5] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#8364ED]/20 border-t-[#8364ED] rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-700 tracking-wide animate-pulse">
          Initializing Files Manager Portal...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Role-Based Navigation & Rendering
  if (currentUser.role === 'ADMIN') {
    return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser.role === 'MANAGER') {
    return <ManagerDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // CLIENT / USER
  return <ClientDashboard currentUser={currentUser} onLogout={handleLogout} />;
}

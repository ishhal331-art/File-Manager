import React, { useState, useEffect } from 'react';
import { User } from './types';
import { api } from './lib/api';
import { LoginPage } from './components/auth/LoginPage';
import { ClientDashboard } from './components/dashboard/ClientDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { WelcomeModal } from './components/common/WelcomeModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    checkSession();

    // Prevent browser back button from closing application or leaving site
    try {
      window.history.pushState({ app: 'portal_home' }, '', window.location.href);
    } catch (err) {
      console.warn('History API initialized:', err);
    }

    const handlePopState = () => {
      // If welcome modal is open, close it first
      setShowWelcomeModal(false);

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
      if (res.user && !sessionStorage.getItem('hra_welcome_seen')) {
        setShowWelcomeModal(true);
        sessionStorage.setItem('hra_welcome_seen', 'true');
      }
    } catch (err) {
      console.log('No active session found or token expired.');
      setCurrentUser(null);
    } finally {
      setInitializing(false);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowWelcomeModal(true);
    sessionStorage.setItem('hra_welcome_seen', 'true');
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('hra_welcome_seen');
    } catch (err) {
      // ignore
    }
    await api.logout();
    setCurrentUser(null);
    setShowWelcomeModal(false);
  };

  if (initializing) {
    return (
      <div className="min-h-screen w-full bg-[#0E1120] text-[#AEB8CC] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#22D39F]/20 border-t-[#22D39F] rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-[#F0F4FF] tracking-wide animate-pulse">
          Initializing HRA Accountant Portal...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      {/* Role-Based Navigation & Rendering */}
      {currentUser.role === 'ADMIN' && (
        <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
      )}

      {currentUser.role === 'MANAGER' && (
        <ManagerDashboard currentUser={currentUser} onLogout={handleLogout} />
      )}

      {currentUser.role === 'USER' && (
        <ClientDashboard currentUser={currentUser} onLogout={handleLogout} />
      )}

      {/* FANCY WELCOME MODAL POPUP UPON LOGIN */}
      <WelcomeModal
        user={currentUser}
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </>
  );
}

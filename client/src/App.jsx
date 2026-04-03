import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EventInfoSection from './components/EventInfoSection';
import AgendaSection from './components/AgendaSection';
import RegistrationForm from './components/RegistrationForm';
import MemberStatus from './components/MemberStatus';
import LoginPage from './pages/LoginPage';
import MemberPage from './pages/MemberPage';
import SetPasswordPage from './pages/SetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminPage from './pages/AdminPage';
import LineCallbackPage from './pages/LineCallbackPage';
import './App.css';

function EventPage() {
  return (
    <div className="app">
      <EventInfoSection />
      <AgendaSection />
      <RegistrationForm />
    </div>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed', bottom: '2rem', right: '1.5rem', zIndex: 999,
        width: '44px', height: '44px', borderRadius: '50%',
        background: '#6c63ff', color: '#fff', border: 'none',
        fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      title="回到頂部"
    >↑</button>
  );
}

function App() {
  return (
    <>
      <MemberStatus />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<EventPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/member" element={<MemberPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/line-callback" element={<LineCallbackPage />} />
      </Routes>
    </>
  );
}

export default App;

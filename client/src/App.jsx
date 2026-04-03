import { Routes, Route } from 'react-router-dom';
import EventInfoSection from './components/EventInfoSection';
import AgendaSection from './components/AgendaSection';
import RegistrationForm from './components/RegistrationForm';
import MemberStatus from './components/MemberStatus';
import LoginPage from './pages/LoginPage';
import MemberPage from './pages/MemberPage';
import SetPasswordPage from './pages/SetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminPage from './pages/AdminPage';
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

function App() {
  return (
    <>
      <MemberStatus />
      <Routes>
        <Route path="/" element={<EventPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/member" element={<MemberPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}

export default App;

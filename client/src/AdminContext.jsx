import { createContext, useContext, useState } from 'react';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // isAdmin is session-only: resets on page refresh
  // localStorage only used to pre-fill the password input
  const [isAdmin, setIsAdmin] = useState(false);

  function login(password) {
    localStorage.setItem('adminPw', password);
    setIsAdmin(true);
  }

  function logout() {
    localStorage.removeItem('adminPw');
    setIsAdmin(false);
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}

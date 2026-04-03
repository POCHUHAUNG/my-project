import { createContext, useContext, useState } from 'react';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('adminPw'));

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

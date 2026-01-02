// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types/auth';

type AuthContextType = {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, role: UserRole) => {
    const users: Record<UserRole, User> = {
      ADMIN: { id: '1', name: 'Admin User', email, role: 'ADMIN' },
      PFO: { id: '2', name: 'Property Officer', email, role: 'PFO' },
      CS: { id: '3', name: 'Customer Service', email, role: 'CS' },
    };
    setUser(users[role]);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

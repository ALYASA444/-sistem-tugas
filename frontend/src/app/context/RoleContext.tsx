import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'komti' | 'mahasiswa' | null;

interface RoleContextType {
  role: Role;
  userId: string | null;
  isAuthenticated: boolean;
  login: (selectedRole: 'komti' | 'mahasiswa', id?: string) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const login = (selectedRole: 'komti' | 'mahasiswa', id?: string) => {
    setRole(selectedRole);
    if (id) setUserId(id);
  };

  const logout = () => {
    setRole(null);
    setUserId(null);
  };

  return (
    <RoleContext.Provider value={{ role, userId, isAuthenticated: role !== null, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
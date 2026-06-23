import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Role = 'komti' | 'mahasiswa' | null;

interface RoleContextType {
  role: Role;
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (selectedRole: 'komti' | 'mahasiswa', id?: string, accessToken?: string) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const STORAGE_KEY = 'sistemkelas_auth';

function loadAuth(): { role: Role; userId: string | null; token: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.role && (parsed.role === 'komti' || parsed.role === 'mahasiswa')) {
        return { role: parsed.role, userId: parsed.userId || null, token: parsed.token || null };
      }
    }
  } catch { /* ignore corrupt data */ }
  return { role: null, userId: null, token: null };
}

function saveAuth(role: Role, userId: string | null, token: string | null) {
  if (role) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role, userId, token }));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const initial = loadAuth();
  const [role, setRole] = useState<Role>(initial.role);
  const [userId, setUserId] = useState<string | null>(initial.userId);
  const [token, setToken] = useState<string | null>(initial.token);

  useEffect(() => {
    saveAuth(role, userId, token);
  }, [role, userId, token]);

  const login = (selectedRole: 'komti' | 'mahasiswa', id?: string, accessToken?: string) => {
    setRole(selectedRole);
    setUserId(id || null);
    setToken(accessToken || null);
  };

  const logout = () => {
    setRole(null);
    setUserId(null);
    setToken(null);
  };

  return (
    <RoleContext.Provider value={{ role, userId, token, isAuthenticated: role !== null, login, logout }}>
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

import { NavLink, Outlet, useLocation, Navigate } from 'react-router';
import { useRole } from '../context/RoleContext';
import { useData } from '../context/DataContext';
import { BookOpen, LayoutDashboard, ListTodo, MessageSquareWarning, LogOut, Menu, X, GraduationCap, Users } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

export const Layout = () => {
  const { role, userId, isAuthenticated, logout } = useRole();
  const { users } = useData();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = users.find(u => u.id === userId);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?return=${returnUrl}`} replace />;
  }

  const navLinks = [
    { to: '/', label: 'Beranda', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/tasks', label: 'Tugas', icon: <ListTodo className="w-5 h-5" /> },
    { to: '/materials', label: 'Materi', icon: <BookOpen className="w-5 h-5" /> },
    { to: '/announcements', label: 'Pengumuman', icon: <MessageSquareWarning className="w-5 h-5" /> },
  ];

  if (role === 'komti') {
    navLinks.push({ to: '/users', label: 'Kelola Pengguna', icon: <Users className="w-5 h-5" /> });
  }

  const currentPath = location.pathname.split('/')[1];
  const pageTitle = navLinks.find(link => link.to === `/${currentPath}`)?.label || (currentPath === 'users' ? 'Kelola Pengguna' : 'Beranda');

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900 font-sans">

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white border-r border-neutral-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200">
            <div className="flex items-center space-x-2 text-indigo-700">
              <GraduationCap className="w-6 h-6" />
              <h1 className="text-xl font-bold tracking-tight">SistemKelas</h1>
            </div>
            <button
              className="lg:hidden p-2 -mr-2 text-neutral-500 hover:bg-neutral-100 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-16rem)]">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 font-medium'
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-neutral-200 bg-neutral-50/50">
          <div className="mb-4">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Masuk Sebagai:</p>
            {currentUser ? (
              <div className="p-3 bg-white shadow-sm rounded-lg border border-neutral-200">
                <p className="text-sm font-bold text-neutral-900 truncate" title={currentUser.name}>{currentUser.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-neutral-500 font-medium">NIM: {currentUser.nim}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentUser.role === 'komti' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white shadow-sm rounded-lg border border-neutral-200 animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-10 shadow-sm transition-all" onClick={logout}>
            <LogOut className="w-4 h-4" />
            <span className="font-semibold text-sm">Keluar (Logout)</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-neutral-50 h-screen overflow-hidden relative">
        <header className="h-16 flex-none bg-white/80 backdrop-blur-md border-b border-neutral-200 flex items-center px-4 lg:px-8 z-10 sticky top-0">
          <button
            className="lg:hidden p-2 -ml-2 mr-3 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">
            {pageTitle}
          </h2>
        </header>

        <div className="flex-1 overflow-auto overflow-x-hidden p-4 lg:p-8 w-full">
          <div className="max-w-5xl mx-auto w-full pb-16">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

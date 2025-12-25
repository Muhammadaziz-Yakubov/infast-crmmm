import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  UserPlus, 
  UserCheck, 
  CreditCard, 
  ClipboardCheck,
  Moon,
  Sun,
  LogOut,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileCode,
  Trophy
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/courses', icon: BookOpen, label: 'Kurslar', adminOnly: true },
    { path: '/groups', icon: Users, label: 'Guruhlar' },
    { path: '/students', icon: UserCheck, label: 'O\'quvchilar' },
    { path: '/leads', icon: UserPlus, label: 'Nabor', adminOnly: true },
    { path: '/payments', icon: CreditCard, label: 'To\'lovlar' },
    { path: '/attendance', icon: ClipboardCheck, label: 'Davomat' },
    { path: '/tasks', icon: FileCode, label: 'Vazifalar' },
    { path: '/rating', icon: Trophy, label: 'Reyting' },
    { path: '/staff', icon: UserCog, label: 'Xodimlar', adminOnly: true },
  ];

  // Filter menu items based on role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full z-20 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}>
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-xl flex flex-col">
          {/* Logo */}
          <div className={`p-6 border-b border-gray-100 dark:border-gray-700 ${collapsed ? 'px-4' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="text-white" size={22} />
              </div>
              {!collapsed && (
                <div className="animate-slide-in-left">
                  <h1 className="text-xl font-bold gradient-text">InFast CRM</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">O'quv markazlar uchun</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'sidebar-link-active'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } ${collapsed ? 'justify-center' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  title={collapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
            {/* Role Badge */}
            {!collapsed && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Rol</p>
                <p className={`font-semibold ${isAdmin ? 'text-purple-600 dark:text-purple-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                  {isAdmin ? 'Administrator' : 'Manager'}
                </p>
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? (darkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim') : ''}
            >
              {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
              {!collapsed && <span className="font-medium">{darkMode ? 'Yorug\' rejim' : 'Qorong\'u rejim'}</span>}
            </button>
            
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? 'Chiqish' : ''}
            >
              <LogOut size={20} />
              {!collapsed && <span className="font-medium">Chiqish</span>}
            </button>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-md flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-72'} min-h-screen`}>
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

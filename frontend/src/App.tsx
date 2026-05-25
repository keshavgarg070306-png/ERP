import React, { useEffect, useState } from 'react';
import { useAuthStore } from './context/authStore';
import { useToastStore } from './context/toastStore';
import { useNotificationStore } from './context/notificationStore';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Finance } from './pages/Finance';
import { HR } from './pages/HR';
import { SettingsPage } from './pages/Settings';
import { Toast } from './components/Toast';
import { CommandPalette } from './components/CommandPalette';
import { Avatar } from './components/Avatar';
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Search, 
  LogOut, 
  Compass, 
  Warehouse, 
  KanbanSquare, 
  CircleDollarSign, 
  Users2, 
  Settings as SettingsIcon
} from 'lucide-react';

export const App: React.FC = () => {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { notifications, unreadCount, fetchNotifications, markAllAsRead, markAsRead } = useNotificationStore();

  // Layout states
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // Authenticate session on boot
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch notifications on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Periodically refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Listen for Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await logout();
    addToast('Logged out of system successfully', 'info');
  };

  const handleQuickAction = (action: string) => {
    if (action === 'new-order') {
      setCurrentPage('sales');
      addToast('Navigate to Sales Kanban pipeline to create a new order', 'info');
    } else if (action === 'new-invoice') {
      setCurrentPage('finance');
      addToast('Billing Invoices list loaded', 'info');
    } else if (action === 'add-product') {
      setCurrentPage('inventory');
      addToast('Hired product catalog view. Use the top "+ Add Product" button.', 'info');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-xs font-mono text-text-muted uppercase">Booting NexCore ERP...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <Login onSuccess={checkAuth} />
        <Toast />
      </>
    );
  }

  // Sidebar navigation menu options matching roles checks
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Compass className="w-5 h-5" />, visible: true },
    { id: 'inventory', label: 'Inventory', icon: <Warehouse className="w-5 h-5" />, visible: user.role.readInventory },
    { id: 'sales', label: 'Sales & Orders', icon: <KanbanSquare className="w-5 h-5" />, visible: user.role.readSales },
    { id: 'finance', label: 'Finance & Accounts', icon: <CircleDollarSign className="w-5 h-5" />, visible: user.role.readFinance },
    { id: 'hr', label: 'HR & Payroll', icon: <Users2 className="w-5 h-5" />, visible: user.role.readHR },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" />, visible: user.role.readSettings },
  ];

  return (
    <div className="min-h-screen flex bg-background text-text-primary selection:bg-primary selection:text-white">
      {/* Sidebar */}
      <aside 
        className={`bg-[#12141A] border-r border-[#1E2130] flex flex-col justify-between transition-all duration-300 ease-in-out z-30 ${
          sidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex flex-col">
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#1E2130]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 bg-primary/15 border border-primary/35 rounded-lg flex items-center justify-center font-black text-primary text-sm flex-shrink-0">
                NC
              </div>
              {sidebarExpanded && (
                <span className="font-bold font-mono tracking-wider text-xs whitespace-nowrap">
                  NEXCORE <span className="text-primary text-[10px]">v1.0</span>
                </span>
              )}
            </div>

            {/* Collapse toggle button */}
            <button 
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-[#1E2130]/50"
            >
              {sidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-3 mt-4">
            {navigationItems.filter(item => item.visible).map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wide group relative ${
                    isActive 
                      ? 'bg-primary text-white font-bold shadow-glow border border-primary/30' 
                      : 'text-text-muted hover:text-text-primary hover:bg-[#1E2130]/30'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-text-muted group-hover:text-text-primary transition-colors'}>
                    {item.icon}
                  </span>
                  
                  {sidebarExpanded && (
                    <span className="transition-opacity duration-200">
                      {item.label}
                    </span>
                  )}

                  {/* Icon Tooltip when collapsed */}
                  {!sidebarExpanded && (
                    <div className="absolute left-20 bg-surface border border-border text-text-primary text-[10px] font-bold font-mono uppercase px-2.5 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-40">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-3 border-t border-[#1E2130] flex flex-col gap-2">
          {sidebarExpanded ? (
            <div className="flex items-center gap-3 bg-[#0A0B0F]/40 border border-border p-2.5 rounded-xl">
              <Avatar name={user.name} size="sm" />
              <div className="flex flex-col min-w-0 flex-grow font-mono text-[10px]">
                <span className="font-bold text-text-primary truncate">{user.name}</span>
                <span className="text-primary truncate text-[9px] uppercase font-bold tracking-wider">{user.role.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-text-muted hover:text-danger p-1 rounded-lg hover:bg-surface/50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-xl text-text-muted hover:text-danger hover:bg-surface/50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main View */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="h-16 bg-[#12141A]/80 border-b border-[#1E2130] px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-20">
          {/* Search Trigger */}
          <button 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#0A0B0F] border border-border hover:border-text-muted rounded-lg text-xs font-mono text-text-muted transition-all active:scale-[0.98] w-64 text-left"
          >
            <Search className="w-4 h-4" />
            <span>Search console...</span>
            <kbd className="ml-auto bg-[#1E2130] text-[10px] px-1.5 py-0.5 rounded border border-border font-mono font-bold tracking-wide">
              ⌘K
            </kbd>
          </button>

          {/* Notifications bell and Profile */}
          <div className="flex items-center gap-4 relative">
            
            {/* Notification Bell Icon */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className={`p-2 rounded-lg border border-border hover:border-text-muted transition-all relative ${
                  isNotifDropdownOpen ? 'bg-[#1E2130] border-text-muted' : 'bg-[#0A0B0F]'
                }`}
              >
                <Bell className="w-4.5 h-4.5 text-text-muted hover:text-text-primary transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-danger text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-glow-danger border border-background">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Bell Dropdown Panel */}
              {isNotifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 glass-modal border border-border rounded-xl shadow-2xl z-50 p-4 font-mono text-xs animate-scale-in">
                    <div className="flex justify-between items-center border-b border-border pb-2.5 mb-2.5 flex-shrink-0">
                      <span className="font-bold text-text-primary uppercase text-[10px]">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => { markAllAsRead(); addToast('Notifications cleared', 'success'); }}
                          className="text-[9px] text-primary hover:underline uppercase font-bold"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    
                    {/* Log items */}
                    <div className="max-h-[250px] overflow-y-auto flex flex-col gap-2.5 pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-text-muted text-[10px]">No notification events.</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id}
                            onClick={() => { markAsRead(n.id); setIsNotifDropdownOpen(false); }}
                            className={`p-2.5 rounded-lg border hover:bg-[#1E2130]/20 transition-all cursor-pointer ${
                              n.status === 'UNREAD' 
                                ? 'border-primary/20 bg-primary/5 font-bold' 
                                : 'border-border bg-transparent'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] text-text-primary leading-tight font-bold">{n.title}</span>
                              <span className="text-[8px] text-text-muted flex-shrink-0">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[10px] text-text-muted leading-relaxed mt-1 font-normal">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <Avatar name={user.name} size="sm" />
              <div className="hidden md:flex flex-col text-left font-mono">
                <span className="text-[11px] font-bold text-text-primary leading-tight">{user.name}</span>
                <span className="text-[9px] text-text-muted">{user.role.name} Console</span>
              </div>
            </div>
          </div>
        </header>

        {/* Route views */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8 max-w-[1600px] w-full mx-auto relative pb-20">
          
          {currentPage === 'dashboard' && <Dashboard onQuickAction={handleQuickAction} />}
          {currentPage === 'inventory' && <Inventory />}
          {currentPage === 'sales' && <Sales />}
          {currentPage === 'finance' && <Finance />}
          {currentPage === 'hr' && <HR />}
          {currentPage === 'settings' && <SettingsPage />}

        </main>
      </div>

      {/* Overlays */}
      <Toast />
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(page) => {
          setCurrentPage(page);
          addToast(`Console route: ${page.toUpperCase()}`, 'info');
        }}
        onTriggerAction={handleQuickAction}
      />
    </div>
  );
};

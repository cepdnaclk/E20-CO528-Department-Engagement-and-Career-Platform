import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Home, Briefcase, Calendar, FlaskConical, MessageCircle, BarChart3, Bell, Search, LogOut, User, Menu, X } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState({ notifications: [], unreadCount: 0 });
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch {}
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Feed';
    if (path.startsWith('/profile')) return 'Profile';
    if (path === '/jobs') return 'Jobs & Internships';
    if (path === '/events') return 'Events';
    if (path === '/research') return 'Research';
    if (path === '/messaging') return 'Messaging';
    if (path === '/analytics') return 'Analytics';
    return 'DECP';
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/jobs', icon: Briefcase, label: 'Jobs & Internships' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/research', icon: FlaskConical, label: 'Research' },
    { to: '/messaging', icon: MessageCircle, label: 'Messaging' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/analytics', icon: BarChart3, label: 'Analytics' });
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">D</div>
          <div>
            <h1>DECP</h1>
            <span>Dept. of Computer Engineering</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <Icon /> {label}
              </NavLink>
            ))}
          </div>
          <div className="nav-section">
            <div className="nav-section-title">Account</div>
            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <User /> My Profile
            </NavLink>
            <button className="nav-link" onClick={logout}>
              <LogOut /> Logout
            </button>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => { setSidebarOpen(false); }}>
            <div className="avatar avatar-sm">{user?.name?.charAt(0)}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="navbar">
          <div className="navbar-left">
            <button className="btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }}>
              {sidebarOpen ? <X /> : <Menu />}
            </button>
            <h2>{getPageTitle()}</h2>
          </div>
          <div className="navbar-right">
            <div className="navbar-search">
              <Search />
              <input type="text" placeholder="Search DECP..." />
            </div>
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {notifications.unreadCount > 0 && <span className="notification-badge">{notifications.unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <h4>Notifications</h4>
                    {notifications.unreadCount > 0 && <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>}
                  </div>
                  {notifications.notifications.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications</div>
                  ) : (
                    notifications.notifications.map(n => (
                      <div key={n._id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                        <div>{n.message}</div>
                        <div className="notif-time">{timeAgo(n.createdAt)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="avatar avatar-sm" style={{ cursor: 'pointer' }}>{user?.name?.charAt(0)}</div>
          </div>
        </header>
        <div className={location.pathname === '/messaging' ? '' : 'page-content'}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

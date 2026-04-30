import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
  Briefcase,
} from 'lucide-react';
import { animate, stagger } from 'animejs';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from '../components/auth-context';
import { API_BASE_URL } from '../lib/apiBaseUrl';
import { fetchDashboardOverview, updateDashboardMessage, replyToMessage, sendDirectMessage } from '../lib/dashboardApi';
import './Dashboard.css';

const EMPTY_DASHBOARD_STATE = {
  activity: {
    dailyVolume: [],
    statusBreakdown: [],
    topDomains: [],
  },
  messages: [],
  recentMessages: [],
  stats: {
    archivedMessages: 0,
    averageMessageLength: 0,
    messagesThisWeek: 0,
    totalMessages: 0,
    uniqueSenders: 0,
    unreadMessages: 0,
  },
};

const getPageTitle = (pathname) => {
  if (pathname.startsWith('/dashboard/messages')) {
    return 'Inbox Control';
  }

  if (pathname.startsWith('/dashboard/analytics')) {
    return 'Message Analytics';
  }

  if (pathname.startsWith('/dashboard/settings')) {
    return 'Account Settings';
  }

  if (pathname.startsWith('/dashboard/new-project')) {
    return 'Project Composer';
  }

  return 'Portfolio Overview';
};

const DashboardLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD_STATE);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [updatingMessageId, setUpdatingMessageId] = useState(null);
  const mobileNavRef = useRef(null);
  const { logout, token, user } = useAuth();

  const loadDashboard = async ({ showLoading = true } = {}) => {
    if (!token) {
      setDashboardData(EMPTY_DASHBOARD_STATE);
      setDashboardLoading(false);
      return;
    }

    if (showLoading) {
      setDashboardLoading(true);
    }

    try {
      const nextDashboardData = await fetchDashboardOverview(token);
      setDashboardData(nextDashboardData);
      setDashboardError('');
    } catch (error) {
      setDashboardError(error.message || 'Unable to load dashboard data.');
      setDashboardData(EMPTY_DASHBOARD_STATE);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const run = async () => {
      if (!token) {
        setDashboardLoading(false);
        return;
      }

      setDashboardLoading(true);

      try {
        const nextDashboardData = await fetchDashboardOverview(token);

        if (isCancelled) {
          return;
        }

        setDashboardData(nextDashboardData);
        setDashboardError('');
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setDashboardError(error.message || 'Unable to load dashboard data.');
        setDashboardData(EMPTY_DASHBOARD_STATE);
      } finally {
        if (!isCancelled) {
          setDashboardLoading(false);
        }
      }
    };

    run();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      console.log('Dashboard Socket Connected');
    });

    socket.on('new_message', (data) => {
      toast.success(`New message from ${data.name}`, {
        description: data.subject,
        action: {
          label: 'View',
          onClick: () => window.location.href = '/dashboard/messages'
        }
      });
      loadDashboard({ showLoading: false });
    });

    socket.on('new_reply', () => {
      loadDashboard({ showLoading: false });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    animate('.mobile-dock-item', {
      translateY: [20, 0],
      opacity: [0, 1],
      delay: stagger(100),
      easing: 'easeOutElastic(1, .8)',
    });
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      animate('.mobile-drawer', {
        translateX: ['-100%', '0%'],
        duration: 500,
        easing: 'easeOutQuart',
      });
      animate('.drawer-nav-item', {
        opacity: [0, 1],
        translateX: [-20, 0],
        delay: stagger(50, { start: 200 }),
        easing: 'easeOutCubic',
      });
    }
  }, [isMobileMenuOpen]);

  const firstAvailableMessage = dashboardData.messages.find((message) => message.status !== 'archived')
    || dashboardData.messages[0]
    || null;
  const resolvedSelectedMessageId = dashboardData.messages.some(
    (message) => message.id === selectedMessageId,
  )
    ? selectedMessageId
    : firstAvailableMessage?.id || null;

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      animate('.mobile-drawer', {
        translateX: [0, '-100%'],
        duration: 400,
        easing: 'easeInQuart',
        complete: () => setIsMobileMenuOpen(false),
      });
    } else {
      setIsMobileMenuOpen(true);
    }
  };

  const isPathActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }

    return path !== '/dashboard' && location.pathname.startsWith(path);
  };

  const handleRefreshDashboard = async () => {
    await loadDashboard({ showLoading: false });
  };

  const handleMessageUpdate = async (messageId, updates) => {
    setUpdatingMessageId(messageId);

    try {
      await updateDashboardMessage(token, messageId, updates);
      await loadDashboard({ showLoading: false });
      setDashboardError('');
      return true;
    } catch (error) {
      setDashboardError(error.message || 'Unable to update the selected message.');
      return false;
    } finally {
      setUpdatingMessageId(null);
    }
  };

  const handleSendReply = async (messageId, text) => {
    setUpdatingMessageId(messageId);
    try {
      await replyToMessage(token, messageId, text);
      await loadDashboard({ showLoading: false });
      return true;
    } catch (error) {
      setDashboardError(error.message || 'Unable to send reply.');
      return false;
    } finally {
      setUpdatingMessageId(null);
    }
  };

  const handleComposeMessage = async (messageData) => {
    setUpdatingMessageId('new');
    try {
      await sendDirectMessage(token, messageData);
      await loadDashboard({ showLoading: false });
      return true;
    } catch (error) {
      setDashboardError(error.message || 'Unable to send message.');
      return false;
    } finally {
      setUpdatingMessageId(null);
    }
  };


  const dashboardContext = {
    dashboardData,
    dashboardError,
    dashboardLoading,
    refreshDashboard: handleRefreshDashboard,
    selectedMessageId: resolvedSelectedMessageId,
    setSelectedMessageId,
    updateMessage: handleMessageUpdate,
    sendReply: handleSendReply,
    composeMessage: handleComposeMessage,
    updatingMessageId,
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">SM</div>
          <span>Soham Portfolio</span>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${isPathActive('/dashboard') ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/" className="nav-item">
            <Briefcase size={20} /> My Portfolio
          </Link>
          <Link
            to="/dashboard/messages"
            className={`nav-item ${isPathActive('/dashboard/messages') ? 'active' : ''}`}
          >
            <MessageSquare size={20} /> Messages
          </Link>
          <Link
            to="/dashboard/analytics"
            className={`nav-item ${isPathActive('/dashboard/analytics') ? 'active' : ''}`}
          >
            <Users size={20} /> Analytics
          </Link>
          <div className="nav-divider" />
          <Link
            to="/dashboard/settings"
            className={`nav-item ${isPathActive('/dashboard/settings') ? 'active' : ''}`}
          >
            <Settings size={20} /> Settings
          </Link>
          <button
            onClick={logout}
            className="nav-item logout"
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={20} /> Sign Out
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left-group">
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              <Menu size={24} />
            </button>
            <div className="dashboard-title-context">
              <h2>{getPageTitle(location.pathname)}</h2>
              <p>{dashboardLoading ? 'Syncing dashboard...' : `${dashboardData.stats.totalMessages} submissions tracked`}</p>
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-btn hide-mobile" onClick={handleRefreshDashboard} title="Refresh dashboard">
              <Bell size={20} />
            </button>
            <div className="profile-pill">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'Soham')}`}
                alt="Profile"
              />
              <span className="hide-mobile">{user?.name || 'Dashboard User'}</span>
            </div>
          </div>
        </header>

        <section className="dashboard-content">
          <Outlet context={dashboardContext} />
        </section>
      </main>

      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={toggleMobileMenu}>
          <aside className="mobile-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div className="sidebar-logo">
                <div className="logo-icon">SM</div>
                <span>Soham Portfolio</span>
              </div>
              <button className="close-drawer" onClick={toggleMobileMenu}>
                <X size={24} />
              </button>
            </div>

            <nav className="drawer-nav">
              <Link to="/dashboard" className="drawer-nav-item" onClick={toggleMobileMenu}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link to="/" className="drawer-nav-item" onClick={toggleMobileMenu}>
                <Briefcase size={20} /> Portfolio Home
              </Link>
              <Link to="/dashboard/messages" className="drawer-nav-item" onClick={toggleMobileMenu}>
                <MessageSquare size={20} /> Messages
              </Link>
              <Link to="/dashboard/analytics" className="drawer-nav-item" onClick={toggleMobileMenu}>
                <Users size={20} /> Analytics
              </Link>
              <div className="nav-divider" />
              <Link to="/dashboard/settings" className="drawer-nav-item" onClick={toggleMobileMenu}>
                <Settings size={20} /> Settings
              </Link>
              <button className="drawer-nav-item" onClick={logout}>
                <LogOut size={20} /> Sign Out
              </button>
            </nav>
          </aside>
        </div>
      )}

      <div className="mobile-nav-dock" ref={mobileNavRef}>
        <Link to="/dashboard" className={`mobile-dock-item ${isPathActive('/dashboard') ? 'active' : ''}`}>
          <LayoutDashboard size={24} />
          <span>Home</span>
        </Link>
        <Link to="/dashboard/messages" className={`mobile-dock-item ${isPathActive('/dashboard/messages') ? 'active' : ''}`}>
          <MessageSquare size={24} />
          <span>Inbox</span>
        </Link>
        <Link to="/dashboard/analytics" className={`mobile-dock-item ${isPathActive('/dashboard/analytics') ? 'active' : ''}`}>
          <Users size={24} />
          <span>Stats</span>
        </Link>
        <Link to="/dashboard/settings" className={`mobile-dock-item ${isPathActive('/dashboard/settings') ? 'active' : ''}`}>
          <Settings size={24} />
          <span>Menu</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardLayout;

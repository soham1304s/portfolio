import { Link, useOutletContext } from 'react-router-dom';
import {
  Archive,
  ArrowUpRight,
  Mail,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatCompactNumber, formatRelativeTime } from '../lib/dashboardApi';

const DashboardHome = () => {
  const { dashboardData, dashboardError, dashboardLoading } = useOutletContext();
  const { activity, recentMessages, stats } = dashboardData;
  const maxDailyVolume = Math.max(...activity.dailyVolume.map((entry) => entry.count), 1);
  const statCards = [
    {
      color: '#3b82f6',
      icon: Mail,
      label: 'Total Messages',
      value: formatCompactNumber(stats.totalMessages),
      change: `${stats.unreadMessages} unread`,
    },
    {
      color: '#f59e0b',
      icon: TrendingUp,
      label: 'This Week',
      value: formatCompactNumber(stats.messagesThisWeek),
      change: 'last 7 days',
    },
    {
      color: '#10b981',
      icon: Users,
      label: 'Unique Senders',
      value: formatCompactNumber(stats.uniqueSenders),
      change: 'real inbox data',
    },
    {
      color: '#8b5cf6',
      icon: Archive,
      label: 'Archived Threads',
      value: formatCompactNumber(stats.archivedMessages),
      change: `${stats.averageMessageLength} avg chars`,
    },
  ];

  return (
    <>
      <div className="content-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Live inbox activity from the portfolio contact form.</p>
        </div>
        <Link className="add-btn" to="/dashboard/new-project">
          <Plus size={18} />
          Add New Project
        </Link>
      </div>

      {dashboardError && (
        <div className="dashboard-note dashboard-note--error">
          <strong>Dashboard access issue.</strong>
          <span>{dashboardError}</span>
        </div>
      )}

      <div className="stats-grid">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-row">
                <span className="stat-value">{dashboardLoading ? '...' : stat.value}</span>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="grid-card main-chart">
          <div className="card-header">
            <h3>Inbound Volume</h3>
            <span className="text-btn">Last 7 Days <ArrowUpRight size={14} /></span>
          </div>
          <div className="chart-placeholder chart-placeholder--labeled">
            <div className="bar-container">
              {activity.dailyVolume.map((entry) => (
                <div key={entry.date} className="chart-column">
                  <div
                    className="bar"
                    style={{ height: `${Math.max((entry.count / maxDailyVolume) * 100, entry.count > 0 ? 12 : 6)}%` }}
                    title={`${entry.label}: ${entry.count} messages`}
                  />
                  <span>{entry.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-card recent-messages">
          <div className="card-header">
            <h3>Recent Messages</h3>
            <Link className="text-btn" to="/dashboard/messages">View All</Link>
          </div>
          <div className="messages-list">
            {recentMessages.length === 0 ? (
              <div className="dashboard-note">
                <strong>No inquiries yet.</strong>
                <span>New contact form submissions will appear here automatically.</span>
              </div>
            ) : (
              recentMessages.map((message) => (
                <div key={message.id} className="message-item">
                  <div className="msg-avatar">{message.sender.initials}</div>
                  <div className="msg-info">
                    <strong>{message.sender.name}</strong>
                    <span>{message.sender.email}</span>
                  </div>
                  <div className="msg-meta">
                    <span className="msg-time">{formatRelativeTime(message.createdAt)}</span>
                    <span className={`msg-status ${message.status}`}>{message.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;

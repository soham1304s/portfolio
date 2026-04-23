import { Calendar, Download, Globe, Mail, TrendingUp } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import './DashboardPages.css';

const STATUS_COLORS = {
  archived: '#8b5cf6',
  read: '#10b981',
  unread: '#f59e0b',
};

const Analytics = () => {
  const { dashboardData, dashboardError, dashboardLoading, refreshDashboard } = useOutletContext();
  const { activity, stats } = dashboardData;
  const maxDailyVolume = Math.max(...activity.dailyVolume.map((entry) => entry.count), 1);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Message Analytics</h1>
          <p>Track inquiry trends, sender mix, and inbox workload from the contact form.</p>
        </div>
        <div className="header-actions">
          <button className="text-btn" onClick={refreshDashboard}><Calendar size={18} /> Refresh Data</button>
          <button className="add-btn" onClick={refreshDashboard}><Download size={18} /> Sync Inbox</button>
        </div>
      </div>

      {dashboardError && (
        <div className="dashboard-note dashboard-note--error">
          <strong>Analytics unavailable.</strong>
          <span>{dashboardError}</span>
        </div>
      )}

      <div className="analytics-grid">
        <div className="grid-card full-width">
          <div className="card-header">
            <h3>Inquiry Flow</h3>
            <div className="chart-legend">
              <span className="legend-item"><span className="dot views" /> Daily submissions</span>
              <span className="legend-item"><span className="dot clicks" /> Previous day</span>
            </div>
          </div>
          <div className="large-chart-placeholder">
            <div className="chart-bars">
              {activity.dailyVolume.map((entry, index) => {
                const previousCount = activity.dailyVolume[index - 1]?.count ?? entry.count;
                const height = Math.max((entry.count / maxDailyVolume) * 100, entry.count > 0 ? 14 : 6);
                const previousHeight = Math.max(
                  (previousCount / maxDailyVolume) * 100,
                  previousCount > 0 ? 14 : 6,
                );

                return (
                  <div key={entry.date} className="bar-group">
                    <div className="bar primary" style={{ height: `${height}%` }} />
                    <div className="bar secondary" style={{ height: `${previousHeight}%` }} />
                  </div>
                );
              })}
            </div>
            <div className="chart-labels">
              {activity.dailyVolume.map((entry) => <span key={entry.date}>{entry.label}</span>)}
            </div>
          </div>
        </div>

        <div className="grid-card">
          <div className="card-header">
            <h3>Status Breakdown</h3>
            <Mail size={20} className="text-muted" />
          </div>
          <div className="device-list">
            {activity.statusBreakdown.map((item) => (
              <div key={item.status} className="device-item">
                <div className="device-info">
                  <span>{item.status}</span>
                  <strong>{dashboardLoading ? '...' : `${item.count} · ${item.percentage}%`}</strong>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.percentage}%`, backgroundColor: STATUS_COLORS[item.status] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-card">
          <div className="card-header">
            <h3>Top Email Domains</h3>
            <Globe size={20} className="text-muted" />
          </div>
          <div className="geo-list">
            {activity.topDomains.length === 0 ? (
              <div className="dashboard-note">
                <strong>No sender data yet.</strong>
                <span>Domains will appear once the contact form receives messages.</span>
              </div>
            ) : (
              activity.topDomains.map((domain) => (
                <div key={domain.domain} className="geo-item">
                  <div className="geo-info">
                    <strong>{domain.domain}</strong>
                    <span>{domain.count} inquiries</span>
                  </div>
                  <span className="geo-trend up">{Math.max(1, Math.round((domain.count / Math.max(stats.totalMessages, 1)) * 100))}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid-card full-width analytics-summary">
          <div className="card-header">
            <h3>Inbox Snapshot</h3>
            <TrendingUp size={20} className="text-muted" />
          </div>
          <div className="analytics-summary__grid">
            <div>
              <span className="analytics-summary__label">Unread now</span>
              <strong>{stats.unreadMessages}</strong>
            </div>
            <div>
              <span className="analytics-summary__label">This week</span>
              <strong>{stats.messagesThisWeek}</strong>
            </div>
            <div>
              <span className="analytics-summary__label">Avg message size</span>
              <strong>{stats.averageMessageLength} chars</strong>
            </div>
            <div>
              <span className="analytics-summary__label">Unique senders</span>
              <strong>{stats.uniqueSenders}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

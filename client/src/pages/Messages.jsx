import { useEffect, useState } from 'react';
import {
  Archive,
  Inbox,
  MailOpen,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { formatMessageDate, formatRelativeTime } from '../lib/dashboardApi';
import './DashboardPages.css';

const MESSAGE_TABS = [
  {
    id: 'inbox',
    label: 'Inbox',
    matcher: (message) => message.status !== 'archived',
  },
  {
    id: 'unread',
    label: 'Unread',
    matcher: (message) => message.status === 'unread',
  },
  {
    id: 'archived',
    label: 'Archived',
    matcher: (message) => message.status === 'archived',
  },
];

const Messages = () => {
  const {
    dashboardData,
    dashboardError,
    dashboardLoading,
    refreshDashboard,
    selectedMessageId,
    setSelectedMessageId,
    updateMessage,
    updatingMessageId,
  } = useOutletContext();
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const activeTabConfig = MESSAGE_TABS.find((tab) => tab.id === activeTab) || MESSAGE_TABS[0];
  const filteredMessages = dashboardData.messages.filter((message) => {
    if (!activeTabConfig.matcher(message)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      message.sender.name,
      message.sender.email,
      message.subject,
      message.message,
    ].join(' ').toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  useEffect(() => {
    if (!filteredMessages.some((message) => message.id === selectedMessageId)) {
      setSelectedMessageId(filteredMessages[0]?.id || null);
    }
  }, [filteredMessages, selectedMessageId, setSelectedMessageId]);

  const selectedMessage = filteredMessages.find((message) => message.id === selectedMessageId)
    || filteredMessages[0]
    || null;

  const handleSelectMessage = async (message) => {
    setSelectedMessageId(message.id);

    if (message.status === 'unread') {
      await updateMessage(message.id, { status: 'read' });
    }
  };

  const handleToggleArchive = async () => {
    if (!selectedMessage) {
      return;
    }

    const nextStatus = selectedMessage.status === 'archived' ? 'read' : 'archived';
    await updateMessage(selectedMessage.id, { status: nextStatus });
  };

  const handleMarkUnread = async () => {
    if (!selectedMessage) {
      return;
    }

    await updateMessage(selectedMessage.id, { status: 'unread' });
  };

  const handleToggleStar = async () => {
    if (!selectedMessage) {
      return;
    }

    await updateMessage(selectedMessage.id, { starred: !selectedMessage.starred });
  };

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>Messages</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <button className="icon-btn-outline" onClick={refreshDashboard} title="Refresh messages">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {dashboardError && (
        <div className="dashboard-note dashboard-note--error">
          <strong>Unable to open inbox.</strong>
          <span>{dashboardError}</span>
        </div>
      )}

      <div className="messages-layout">
        <aside className="messages-sidebar">
          <div className="sidebar-tabs">
            {MESSAGE_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="messages-list">
            {dashboardLoading && filteredMessages.length === 0 ? (
              <div className="dashboard-note">
                <strong>Loading inbox…</strong>
                <span>Pulling the latest submissions from the backend.</span>
              </div>
            ) : null}

            {!dashboardLoading && filteredMessages.length === 0 ? (
              <div className="dashboard-note">
                <strong>No matching messages.</strong>
                <span>Try a different search or switch tabs.</span>
              </div>
            ) : null}

            {filteredMessages.map((message) => (
              <button
                key={message.id}
                className={`message-card ${message.status === 'unread' ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'active' : ''}`}
                onClick={() => handleSelectMessage(message)}
                type="button"
              >
                <div className="card-top">
                  <div className="sender-info">
                    <div className="sender-avatar">{message.sender.initials}</div>
                    <span className="sender-name">{message.sender.name}</span>
                  </div>
                  <span className="msg-date">{formatRelativeTime(message.createdAt)}</span>
                </div>
                <div className="card-body">
                  <h4 className="msg-subject">{message.subject}</h4>
                  <p className="msg-preview">{message.preview}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="message-view">
          {!selectedMessage ? (
            <div className="empty-state">
              <div className="empty-icon"><Inbox size={48} /></div>
              <h3>Select a message to read</h3>
              <p>Choose a conversation from the list to inspect the full submission.</p>
            </div>
          ) : (
            <div className="message-panel">
              <div className="message-panel__header">
                <div>
                  <div className="message-panel__meta">
                    <span className={`msg-status ${selectedMessage.status}`}>{selectedMessage.status}</span>
                    <span>{formatMessageDate(selectedMessage.createdAt)}</span>
                  </div>
                  <h3>{selectedMessage.subject}</h3>
                  <p>{selectedMessage.sender.name} · {selectedMessage.sender.email}</p>
                </div>
                <div className="message-panel__actions">
                  <button
                    className={`icon-btn-outline ${selectedMessage.starred ? 'is-active' : ''}`}
                    onClick={handleToggleStar}
                    disabled={updatingMessageId === selectedMessage.id}
                    title="Toggle star"
                  >
                    <Star size={18} />
                  </button>
                  <button
                    className="icon-btn-outline"
                    onClick={handleMarkUnread}
                    disabled={selectedMessage.status === 'unread' || updatingMessageId === selectedMessage.id}
                  >
                    <MailOpen size={18} />
                  </button>
                  <button
                    className="icon-btn-outline"
                    onClick={handleToggleArchive}
                    disabled={updatingMessageId === selectedMessage.id}
                  >
                    {selectedMessage.status === 'archived' ? <RotateCcw size={18} /> : <Archive size={18} />}
                  </button>
                </div>
              </div>

              <div className="message-panel__details">
                <div className="message-chip">Domain: {selectedMessage.emailDomain}</div>
                <div className="message-chip">Length: {selectedMessage.messageLength} chars</div>
              </div>

              <article className="message-panel__body">
                <p>{selectedMessage.message}</p>
              </article>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;

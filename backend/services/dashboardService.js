const Message = require('../models/Message');

const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
};

const getEmailDomain = (email) => {
  if (!email) return 'unknown';
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) return 'unknown';
  return email.slice(atIndex + 1) || 'unknown';
};

const buildSubject = (message) => {
  if (!message) return 'New portfolio inquiry';
  const trimmed = message.trim();
  return trimmed.length > 64 ? `${trimmed.slice(0, 64).trimEnd()}...` : trimmed;
};

const buildPreview = (message) => {
  if (!message) return 'No message content provided.';
  const trimmed = message.trim();
  return trimmed.length > 120 ? `${trimmed.slice(0, 120).trimEnd()}...` : trimmed;
};

const normalizeMessageRecord = (msg) => {
  return {
    id: msg._id.toString(),
    createdAt: msg.createdAt,
    emailDomain: getEmailDomain(msg.email),
    message: msg.message,
    messageLength: msg.message.length,
    preview: buildPreview(msg.message),
    sender: {
      email: msg.email,
      initials: getInitials(msg.name),
      name: msg.name,
    },
    starred: Boolean(msg.starred),
    status: msg.status || 'unread',
    subject: buildSubject(msg.subject || msg.message),
    updatedAt: msg.updatedAt || msg.createdAt,
  };
};

const buildDailyVolume = (messages, days = 7) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const series = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    const dateKey = date.toISOString().slice(0, 10);
    
    const count = messages.filter(m => {
      const msgDate = new Date(m.createdAt).toISOString().slice(0, 10);
      return msgDate === dateKey;
    }).length;

    series.push({
      count,
      date: dateKey,
      label: formatter.format(date),
    });
  }
  return series;
};

const buildTopDomains = (messages, limit = 4) => {
  const counts = {};
  messages.forEach((m) => {
    const domain = getEmailDomain(m.sender.email);
    counts[domain] = (counts[domain] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([domain, count]) => ({ count, domain }));
};

const buildStatusBreakdown = (messages) => {
  const total = messages.length || 1;
  const counts = { archived: 0, read: 0, unread: 0 };
  messages.forEach((m) => {
    if (counts.hasOwnProperty(m.status)) counts[m.status]++;
  });

  return Object.entries(counts).map(([status, count]) => ({
    count,
    percentage: Math.round((count / total) * 100),
    status,
  }));
};

const getDashboardOverview = async () => {
  const rawMessages = await Message.find().sort({ createdAt: -1 });
  const messages = rawMessages.map(normalizeMessageRecord);
  
  const unreadMessages = messages.filter((m) => m.status === 'unread').length;
  const archivedMessages = messages.filter((m) => m.status === 'archived').length;
  const lastSevenDaysSeries = buildDailyVolume(messages, 7);
  const messagesThisWeek = lastSevenDaysSeries.reduce((total, entry) => total + entry.count, 0);
  const uniqueSenders = new Set(messages.map((m) => m.sender.email)).size;
  const averageLength = messages.length > 0
    ? Math.round(messages.reduce((total, m) => total + m.messageLength, 0) / messages.length)
    : 0;

  return {
    activity: {
      dailyVolume: lastSevenDaysSeries,
      statusBreakdown: buildStatusBreakdown(messages),
      topDomains: buildTopDomains(messages),
    },
    messages,
    recentMessages: messages.filter((m) => m.status !== 'archived').slice(0, 5),
    stats: {
      archivedMessages,
      averageMessageLength: averageLength,
      messagesThisWeek,
      totalMessages: messages.length,
      uniqueSenders,
      unreadMessages,
    },
  };
};

const updateDashboardMessage = async (messageId, updates = {}) => {
  const message = await Message.findById(messageId);
  if (!message) {
    const error = new Error('Message not found.');
    error.statusCode = 404;
    throw error;
  }

  if (updates.status !== undefined) message.status = updates.status;
  if (updates.starred !== undefined) message.starred = updates.starred;
  
  await message.save();
  return normalizeMessageRecord(message);
};

module.exports = {
  getDashboardOverview,
  updateDashboardMessage,
};

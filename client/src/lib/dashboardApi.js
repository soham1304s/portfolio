import { API_BASE_URL } from './apiBaseUrl';

const readApiResponse = async (response) => {
  const rawBody = await response.text();
  const contentType = response.headers.get('content-type') || '';

  if (!rawBody) {
    return {
      payload: null,
      rawBody: '',
    };
  }

  if (contentType.includes('application/json')) {
    try {
      return {
        payload: JSON.parse(rawBody),
        rawBody,
      };
    } catch {
      return {
        payload: null,
        rawBody,
      };
    }
  }

  return {
    payload: null,
    rawBody,
  };
};

const createAuthHeaders = (token, headers = {}) => ({
  'Content-Type': 'application/json',
  ...headers,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const fetchDashboardOverview = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/overview`, {
    headers: createAuthHeaders(token),
  });
  const { payload, rawBody } = await readApiResponse(response);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || rawBody || 'Failed to load dashboard data.');
  }

  return payload;
};

export const updateDashboardMessage = async (token, messageId, updates) => {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/messages/${messageId}`, {
    method: 'PATCH',
    headers: createAuthHeaders(token),
    body: JSON.stringify(updates),
  });
  const { payload, rawBody } = await readApiResponse(response);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || rawBody || 'Failed to update dashboard message.');
  }

  return payload.message;
};

export const replyToMessage = async (token, messageId, text) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/reply`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify({ text }),
  });
  const { payload, rawBody } = await readApiResponse(response);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || rawBody || 'Failed to send reply.');
  }

  return payload.data;
};

export const sendDirectMessage = async (token, messageData) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify(messageData),
  });
  const { payload, rawBody } = await readApiResponse(response);

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || rawBody || 'Failed to send message.');
  }

  return payload.data;
};

export const formatRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return 'Unknown';
  }

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));
};

export const formatMessageDate = (value) => {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
};

export const formatCompactNumber = (value) => new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
}).format(Number(value) || 0);

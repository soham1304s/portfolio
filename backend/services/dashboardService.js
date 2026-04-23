const fs = require('fs/promises');
const path = require('path');

const CONTACT_STORAGE_PATH = path.join(__dirname, '..', 'data', 'contact-submissions.json');
const CONTACT_MESSAGE_STATE_PATH = path.join(__dirname, '..', 'data', 'contact-message-state.json');
const VALID_MESSAGE_STATUSES = new Set(['unread', 'read', 'archived']);

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const readJsonFile = async (filePath, fallbackValue) => {
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const parsedValue = JSON.parse(fileContents);

        if (Array.isArray(fallbackValue)) {
            return Array.isArray(parsedValue) ? parsedValue : fallbackValue;
        }

        if (fallbackValue && typeof fallbackValue === 'object') {
            return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
                ? parsedValue
                : fallbackValue;
        }

        return parsedValue;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return fallbackValue;
        }

        throw error;
    }
};

const writeJsonFile = async (filePath, value) => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
};

const toDateKey = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toISOString().slice(0, 10);
};

const toIsoString = (value, fallbackValue = null) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return fallbackValue;
    }

    return date.toISOString();
};

const getInitials = (value) => {
    const words = normalizeText(value).split(' ').filter(Boolean);

    if (words.length === 0) {
        return '?';
    }

    return words.slice(0, 2).map((word) => word[0]?.toUpperCase() || '').join('');
};

const getEmailDomain = (email) => {
    const normalizedEmail = normalizeText(email).toLowerCase();
    const atIndex = normalizedEmail.lastIndexOf('@');

    if (atIndex === -1) {
        return 'unknown';
    }

    return normalizedEmail.slice(atIndex + 1) || 'unknown';
};

const normalizeMessageStatus = (value) => (
    VALID_MESSAGE_STATUSES.has(value) ? value : 'unread'
);

const buildSubject = (message) => {
    const normalizedMessage = normalizeText(message);

    if (!normalizedMessage) {
        return 'New portfolio inquiry';
    }

    return normalizedMessage.length > 64
        ? `${normalizedMessage.slice(0, 64).trimEnd()}...`
        : normalizedMessage;
};

const buildPreview = (message) => {
    const normalizedMessage = normalizeText(message);

    if (!normalizedMessage) {
        return 'No message content provided.';
    }

    return normalizedMessage.length > 120
        ? `${normalizedMessage.slice(0, 120).trimEnd()}...`
        : normalizedMessage;
};

const normalizeMessageRecord = (submission, storedState = {}) => {
    const id = normalizeText(submission?.id);
    const message = String(submission?.message || '').trim();
    const senderName = normalizeText(submission?.name) || 'Anonymous';
    const senderEmail = normalizeText(submission?.email).toLowerCase();
    const createdAt = toIsoString(submission?.createdAt, new Date().toISOString());
    const status = normalizeMessageStatus(storedState.status);

    return {
        id,
        createdAt,
        emailDomain: getEmailDomain(senderEmail),
        message,
        messageLength: message.length,
        preview: buildPreview(message),
        sender: {
            email: senderEmail,
            initials: getInitials(senderName || senderEmail),
            name: senderName,
        },
        starred: Boolean(storedState.starred),
        status,
        subject: buildSubject(message),
        updatedAt: toIsoString(storedState.updatedAt),
    };
};

const getAllMessages = async () => {
    const [submissions, messageStateMap] = await Promise.all([
        readJsonFile(CONTACT_STORAGE_PATH, []),
        readJsonFile(CONTACT_MESSAGE_STATE_PATH, {}),
    ]);

    return submissions
        .map((submission) => normalizeMessageRecord(submission, messageStateMap[String(submission?.id)]))
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
};

const buildDailyVolume = (messages, days = 7) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
    const countsByDay = new Map(messages.map((message) => [message.id, message]));
    const today = new Date();

    today.setUTCHours(0, 0, 0, 0);

    const series = [];

    for (let index = days - 1; index >= 0; index -= 1) {
        const date = new Date(today);

        date.setUTCDate(today.getUTCDate() - index);

        const dateKey = date.toISOString().slice(0, 10);
        const count = Array.from(countsByDay.values()).filter(
            (message) => toDateKey(message.createdAt) === dateKey,
        ).length;

        series.push({
            count,
            date: dateKey,
            label: formatter.format(date),
        });
    }

    return series;
};

const buildTopDomains = (messages, limit = 4) => {
    const counts = new Map();

    messages.forEach((message) => {
        const domain = message.emailDomain || 'unknown';
        counts.set(domain, (counts.get(domain) || 0) + 1);
    });

    return Array.from(counts.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, limit)
        .map(([domain, count]) => ({ count, domain }));
};

const buildStatusBreakdown = (messages) => {
    const totalMessages = messages.length || 1;
    const counts = {
        archived: 0,
        read: 0,
        unread: 0,
    };

    messages.forEach((message) => {
        counts[message.status] = (counts[message.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
        count,
        percentage: Math.round((count / totalMessages) * 100),
        status,
    }));
};

const getDashboardOverview = async () => {
    const messages = await getAllMessages();
    const unreadMessages = messages.filter((message) => message.status === 'unread').length;
    const archivedMessages = messages.filter((message) => message.status === 'archived').length;
    const lastSevenDaysSeries = buildDailyVolume(messages, 7);
    const messagesThisWeek = lastSevenDaysSeries.reduce((total, entry) => total + entry.count, 0);
    const uniqueSenders = new Set(messages.map((message) => message.sender.email).filter(Boolean)).size;
    const averageMessageLength = messages.length > 0
        ? Math.round(
            messages.reduce((total, message) => total + message.messageLength, 0) / messages.length,
        )
        : 0;

    return {
        activity: {
            dailyVolume: lastSevenDaysSeries,
            statusBreakdown: buildStatusBreakdown(messages),
            topDomains: buildTopDomains(messages),
        },
        messages,
        recentMessages: messages.filter((message) => message.status !== 'archived').slice(0, 5),
        stats: {
            archivedMessages,
            averageMessageLength,
            messagesThisWeek,
            totalMessages: messages.length,
            uniqueSenders,
            unreadMessages,
        },
    };
};

const updateDashboardMessage = async (messageId, updates = {}) => {
    const normalizedId = normalizeText(messageId);
    const submissions = await readJsonFile(CONTACT_STORAGE_PATH, []);
    const matchingSubmission = submissions.find((submission) => String(submission?.id) === normalizedId);

    if (!matchingSubmission) {
        const error = new Error('Message not found.');
        error.statusCode = 404;
        throw error;
    }

    const messageStateMap = await readJsonFile(CONTACT_MESSAGE_STATE_PATH, {});
    const existingState = messageStateMap[normalizedId] || {};
    const nextTimestamp = new Date().toISOString();
    const nextState = {
        ...existingState,
        updatedAt: nextTimestamp,
    };

    if (updates.status !== undefined) {
        nextState.status = normalizeMessageStatus(updates.status);
    }

    if (updates.starred !== undefined) {
        nextState.starred = Boolean(updates.starred);
    }

    messageStateMap[normalizedId] = nextState;
    await writeJsonFile(CONTACT_MESSAGE_STATE_PATH, messageStateMap);

    return normalizeMessageRecord(matchingSubmission, nextState);
};

module.exports = {
    getDashboardOverview,
    updateDashboardMessage,
};

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs/promises');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CONTACT_STORAGE_PATH = path.join(__dirname, 'data', 'contact-submissions.json');
const PENDING_NOTIFICATIONS_PATH = path.join(__dirname, 'data', 'pending-contact-notifications.json');
const PENDING_NOTIFICATION_RETRY_INTERVAL_MS = Number.parseInt(
    process.env.PENDING_NOTIFICATION_RETRY_INTERVAL_MS || String(5 * 60 * 1000),
    10,
);


// Rate limiting
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Database connection
const connectDB = async () => {
    const mongoUri = String(process.env.MONGODB_URI || '').trim();

    if (!mongoUri) {
        console.warn('MongoDB Connection Warning: MONGODB_URI is not configured.');
        console.warn('Authentication features will not work without MongoDB.');
        return;
    }

    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.warn(`MongoDB Connection Warning: ${err.message}`);
        console.warn('Authentication features will not work without MongoDB.');
    }
};

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('Socket Client Connected:', socket.id);
    
    socket.on('join_dashboard', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined dashboard room`);
    });

    socket.on('disconnect', () => {
        console.log('Socket Client Disconnected');
    });
});

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const stripHtml = (value) => normalizeText(String(value || '').replace(/<[^>]*>/g, ' '));
const getErrorMessage = (error, fallbackMessage = 'Unknown error') =>
    error instanceof Error
        ? error.message
        : normalizeText(error) || fallbackMessage;

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const parseBoolean = (value, defaultValue = false) => {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => (
        {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }[character]
    ));

const formatAddress = (name, email) => {
    const normalizedEmail = normalizeText(email);
    const normalizedName = normalizeText(name).replace(/"/g, '\\"');

    if (!normalizedName) {
        return normalizedEmail;
    }

    return `"${normalizedName}" <${normalizedEmail}>`;
};

const getMailConfig = () => {
    const smtpUrl = normalizeText(process.env.SMTP_URL);
    const smtpService = normalizeText(process.env.SMTP_SERVICE);
    const smtpHost = normalizeText(process.env.SMTP_HOST);
    const smtpPort = Number.parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = normalizeText(process.env.SMTP_USER);
    const smtpPass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
    const contactToEmail = normalizeText(process.env.CONTACT_TO_EMAIL);
    const contactFromEmail = normalizeText(process.env.CONTACT_FROM_EMAIL || smtpUser);
    const contactFromName = normalizeText(process.env.CONTACT_FROM_NAME || 'Portfolio Contact');

    const missing = [];

    if (!contactToEmail) {
        missing.push('CONTACT_TO_EMAIL');
    }

    if (!contactFromEmail) {
        missing.push('CONTACT_FROM_EMAIL or SMTP_USER');
    }

    if (!smtpUrl) {
        if (!smtpService && !smtpHost) {
            missing.push('SMTP_SERVICE or SMTP_HOST');
        }

        if (!smtpUser) {
            missing.push('SMTP_USER');
        }

        if (!smtpPass) {
            missing.push('SMTP_PASS');
        }
    }

    return {
        contactFromEmail,
        contactFromName,
        contactToEmail,
        isConfigured: missing.length === 0,
        missing,
        smtpHost,
        smtpPass,
        smtpPort,
        smtpService,
        smtpUrl,
        smtpUser,
        useSecureConnection: parseBoolean(process.env.SMTP_SECURE, smtpPort === 465),
    };
};

const getTransportOptions = (mailConfig) => {
    if (mailConfig.smtpUrl) {
        return mailConfig.smtpUrl;
    }

    if (mailConfig.smtpService) {
        return {
            service: mailConfig.smtpService,
            auth: {
                user: mailConfig.smtpUser,
                pass: mailConfig.smtpPass,
            },
        };
    }

    return {
        host: mailConfig.smtpHost,
        port: mailConfig.smtpPort,
        secure: mailConfig.useSecureConnection,
        auth: {
            user: mailConfig.smtpUser,
            pass: mailConfig.smtpPass,
        },
    };
};

let mailTransporter = null;
let isProcessingPendingNotifications = false;


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

const readJsonArrayFile = async (filePath) => readJsonFile(filePath, []);
const readJsonObjectFile = async (filePath) => readJsonFile(filePath, null);
const writeJsonArrayFile = async (filePath, entries) => writeJsonFile(filePath, entries);

const getMailTransporter = () => {
    if (mailTransporter) {
        return mailTransporter;
    }

    const mailConfig = getMailConfig();

    if (!mailConfig.isConfigured) {
        throw new Error(`Email transport is not configured. Missing: ${mailConfig.missing.join(', ')}`);
    }

    mailTransporter = nodemailer.createTransport(getTransportOptions(mailConfig));

    return mailTransporter;
};

const sendContactNotification = async ({ createdAt, email, message, name }) => {
    const mailConfig = getMailConfig();
    const transporter = getMailTransporter();
    const receivedAt = new Date(createdAt).toISOString();
    const subject = `New portfolio inquiry from ${name}`;
    const plainTextBody = [
        'New portfolio contact form submission',
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `Received At: ${receivedAt}`,
        '',
        'Message:',
        message,
    ].join('\n');

    const htmlBody = [
        '<h2>New portfolio contact form submission</h2>',
        '<p>',
        `<strong>Name:</strong> ${escapeHtml(name)}<br />`,
        `<strong>Email:</strong> ${escapeHtml(email)}<br />`,
        `<strong>Received At:</strong> ${escapeHtml(receivedAt)}`,
        '</p>',
        '<p><strong>Message:</strong></p>',
        `<pre style="white-space: pre-wrap; font: inherit; margin: 0;">${escapeHtml(message)}</pre>`,
    ].join('');

    await transporter.sendMail({
        from: formatAddress(mailConfig.contactFromName, mailConfig.contactFromEmail),
        html: htmlBody,
        replyTo: formatAddress(name, email),
        subject,
        text: plainTextBody,
        to: mailConfig.contactToEmail,
    });
};

const logMailConfiguration = async () => {
    const mailConfig = getMailConfig();

    if (!mailConfig.isConfigured) {
        console.warn(
            `Email delivery is disabled. Missing environment variables: ${mailConfig.missing.join(', ')}`,
        );
        return;
    }

    try {
        await getMailTransporter().verify();
        console.log(`Email transport is ready for ${mailConfig.contactToEmail}`);
    } catch (error) {
        console.error('Email transport verification failed:', error.message);
    }
};

const queuePendingNotification = async (submission, errorMessage) => {
    const pendingNotifications = await readJsonArrayFile(PENDING_NOTIFICATIONS_PATH);
    const existingIndex = pendingNotifications.findIndex((entry) => entry.id === submission.id);
    const queuedNotification = {
        ...submission,
        attempts: existingIndex >= 0 ? (pendingNotifications[existingIndex].attempts || 0) + 1 : 1,
        lastAttemptAt: new Date().toISOString(),
        lastError: normalizeText(errorMessage),
    };

    if (existingIndex >= 0) {
        pendingNotifications[existingIndex] = queuedNotification;
    } else {
        pendingNotifications.push(queuedNotification);
    }

    await writeJsonArrayFile(PENDING_NOTIFICATIONS_PATH, pendingNotifications);
};

const processPendingNotifications = async () => {
    if (isProcessingPendingNotifications) {
        return;
    }

    isProcessingPendingNotifications = true;

    try {
        const pendingNotifications = await readJsonArrayFile(PENDING_NOTIFICATIONS_PATH);

        if (pendingNotifications.length === 0) {
            return;
        }

        const remainingNotifications = [];

        for (const notification of pendingNotifications) {
            try {
                await sendContactNotification(notification);
            } catch (error) {
                remainingNotifications.push({
                    ...notification,
                    attempts: (notification.attempts || 0) + 1,
                    lastAttemptAt: new Date().toISOString(),
                    lastError: getErrorMessage(error, 'Unknown mail delivery error'),
                });
            }
        }

        await writeJsonArrayFile(PENDING_NOTIFICATIONS_PATH, remainingNotifications);

        if (remainingNotifications.length > 0) {
            console.warn(
                `Pending contact notifications remaining: ${remainingNotifications.length}`,
            );
        } else {
            console.log('Pending contact notifications delivered successfully.');
        }
    } catch (error) {
        console.error('Failed to process pending contact notifications:', getErrorMessage(error));
    } finally {
        isProcessingPendingNotifications = false;
    }
};

const saveContactSubmission = async (submission) => {
    const existingSubmissions = await readJsonArrayFile(CONTACT_STORAGE_PATH);

    existingSubmissions.push(submission);

    await writeJsonArrayFile(CONTACT_STORAGE_PATH, existingSubmissions);
};

const createHttpError = (statusCode, message, code = 'server_error') => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};

const readHttpResponse = async (response) => {
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
        } catch (error) {
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



// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

app.get('/', (req, res) => {
    res.send('Portfolio Backend API is running...');
});

// Sample Route for Projects
app.get('/api/projects', (req, res) => {
    const projects = [
        {
            id: 1,
            title: "E-Commerce Platform",
            description: "A full-stack e-commerce solution with payment integration.",
            tech: ["React", "Node.js", "MongoDB", "Stripe"],
            image: "https://via.placeholder.com/600x400"
        },
        {
            id: 2,
            title: "AI Chat Application",
            description: "Real-time chat application with AI-powered responses.",
            tech: ["React", "Socket.io", "OpenAI API"],
            image: "https://via.placeholder.com/600x400"
        },
        {
            id: 3,
            title: "Task Management System",
            description: "A collaborative tool for team project management.",
            tech: ["React", "Redux", "Firebase"],
            image: "https://via.placeholder.com/600x400"
        }
    ];
    res.json(projects);
});



const Message = require('./models/Message');

app.post('/api/contact', contactLimiter, async (req, res) => {
    const name = normalizeText(req.body.name);
    const email = normalizeText(req.body.email).toLowerCase();
    const subject = normalizeText(req.body.subject || 'New Portfolio Inquiry');
    const messageText = String(req.body.message || '').trim();
    const website = normalizeText(req.body.website);

    if (website) {
        return res.status(200).json({
            message: 'Thanks for reaching out. I will review your message soon.',
        });
    }

    if (name.length < 2) {
        return res.status(400).json({ message: 'Please enter your name.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (messageText.length < 10) {
        return res.status(400).json({
            message: 'Please share a few more details so I can respond properly.',
        });
    }

    try {
        const newMessage = await Message.create({
            name,
            email,
            subject,
            message: messageText,
        });

        // Emit Socket Event for real-time dashboard update
        req.io.emit('new_message', {
            id: newMessage._id,
            name,
            email,
            subject,
            message: messageText,
            createdAt: newMessage.createdAt
        });

        const submission = {
            id: newMessage._id,
            name,
            email,
            message: messageText,
            createdAt: newMessage.createdAt,
        };

        try {
            await sendContactNotification(submission);
            void processPendingNotifications();
        } catch (error) {
            console.error('Failed to deliver notification immediately:', error);
        }

        return res.status(201).json({
            success: true,
            message: 'Message received. Soham will get back to you soon.',
            data: newMessage
        });
    } catch (error) {
        console.error('Failed to process contact submission:', error);
        return res.status(500).json({
            message: 'Your message could not be delivered right now. Please try again shortly.',
        });
    }
});

if (require.main === module) {
    const startServer = async () => {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            void logMailConfiguration();

            void processPendingNotifications();

            const retryTimer = setInterval(() => {
                void processPendingNotifications();
            }, PENDING_NOTIFICATION_RETRY_INTERVAL_MS);

            retryTimer.unref();
        });
    };

    void startServer();
}

module.exports = app;

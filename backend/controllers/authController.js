const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
const MAX_ACTIVE_TOKENS = Number.parseInt(process.env.MAX_ACTIVE_TOKENS || '5', 10);

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const ensureAuthDependencies = (res) => {
    if (!process.env.JWT_SECRET) {
        res.status(503).json({
            success: false,
            message: 'Authentication is unavailable because JWT_SECRET is not configured.',
        });
        return false;
    }

    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            success: false,
            message: 'Authentication is unavailable because MongoDB is not connected.',
        });
        return false;
    }

    return true;
};

const getClientIpAddress = (req) => {
    const forwardedFor = normalizeText(req.headers['x-forwarded-for']);

    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    return normalizeText(req.ip);
};

const getUserAgent = (req) => normalizeText(req.get('user-agent')).slice(0, 255);

const buildTokenExpiryDate = (token) => {
    const decodedToken = jwt.decode(token);
    const expiryTimestamp = typeof decodedToken === 'object' ? decodedToken?.exp : null;

    if (Number.isFinite(expiryTimestamp)) {
        return new Date(expiryTimestamp * 1000);
    }

    return new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
};

const trimActiveTokenSessions = (sessions) => {
    const now = Date.now();

    return sessions
        .filter((session) => new Date(session.expiresAt).getTime() > now)
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, MAX_ACTIVE_TOKENS);
};

const sendTokenResponse = async (user, statusCode, res, req) => {
    const tokenId = crypto.randomUUID();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        jwtid: tokenId,
    });
    const nextSession = {
        tokenHash: hashToken(token),
        tokenId,
        createdAt: new Date(),
        expiresAt: buildTokenExpiryDate(token),
        ipAddress: getClientIpAddress(req),
        lastUsedAt: new Date(),
        userAgent: getUserAgent(req),
    };

    user.authTokens = trimActiveTokenSessions([...(user.authTokens || []), nextSession]);
    await user.save({ validateBeforeSave: false });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        if (!ensureAuthDependencies(res)) {
            return;
        }

        const name = normalizeText(req.body.name);
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || '');

        if (name.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please enter your full name.',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.',
            });
        }

        const existingUser = await User.findOne({ email }).select('_id');

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists. Please sign in instead.',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        await sendTokenResponse(user, 201, res, req);
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists. Please sign in instead.',
            });
        }

        res.status(400).json({
            success: false,
            message: err.message || 'Registration failed',
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        if (!ensureAuthDependencies(res)) {
            return;
        }

        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || '');

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password.',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.',
            });
        }

        const user = await User.findOne({ email }).select('+password +authTokens');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        await sendTokenResponse(user, 200, res, req);
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message || 'Login failed',
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        if (!ensureAuthDependencies(res)) {
            return;
        }

        await User.updateOne(
            { _id: req.user.id },
            {
                $pull: {
                    authTokens: {
                        tokenHash: req.currentTokenHash,
                        tokenId: req.currentTokenId,
                    },
                },
            },
        );

        res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Logout failed',
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        if (!ensureAuthDependencies(res)) {
            return;
        }

        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Failed to fetch user data',
        });
    }
};

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization
        && req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route.',
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(503).json({
            success: false,
            message: 'Authentication is unavailable because JWT_SECRET is not configured.',
        });
    }

    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Authentication is unavailable because MongoDB is not connected.',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentTokenHash = hashToken(token);
        const user = await User.findById(decoded.id).select('+authTokens');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'No user found for this session.',
            });
        }

        const activeToken = (user.authTokens || []).find((sessionToken) => (
            sessionToken.tokenId === decoded.jti
            && sessionToken.tokenHash === currentTokenHash
            && new Date(sessionToken.expiresAt).getTime() > Date.now()
        ));

        if (!activeToken) {
            return res.status(401).json({
                success: false,
                message: 'This session is no longer active. Please sign in again.',
            });
        }

        await User.updateOne(
            {
                _id: user._id,
                'authTokens.tokenId': activeToken.tokenId,
            },
            {
                $set: {
                    'authTokens.$.lastUsedAt': new Date(),
                },
            },
        );

        req.user = user;
        req.currentTokenHash = currentTokenHash;
        req.currentTokenId = decoded.jti;

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route.',
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }
        next();
    };
};

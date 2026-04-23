const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboardOverview, updateDashboardMessage } = require('../services/dashboardService');

const router = express.Router();

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const requireDashboardAccess = (req, res, next) => {
    const currentUserEmail = normalizeEmail(req.user?.email);
    const ownerEmails = [
        process.env.CONTACT_TO_EMAIL,
        process.env.CONTACT_FROM_EMAIL,
    ]
        .map(normalizeEmail)
        .filter(Boolean);

    if (req.user?.role === 'admin' || ownerEmails.includes(currentUserEmail)) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'This dashboard is only available to the portfolio owner account.',
    });
};

router.use(protect, requireDashboardAccess);

router.get('/overview', async (req, res) => {
    try {
        const overview = await getDashboardOverview();

        return res.status(200).json({
            success: true,
            ...overview,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to load dashboard overview.',
        });
    }
});

router.patch('/messages/:messageId', async (req, res) => {
    try {
        const updatedMessage = await updateDashboardMessage(req.params.messageId, {
            starred: req.body.starred,
            status: req.body.status,
        });

        return res.status(200).json({
            success: true,
            message: updatedMessage,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to update dashboard message.',
        });
    }
});

module.exports = router;

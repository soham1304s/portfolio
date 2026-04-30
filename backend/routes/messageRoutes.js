const express = require('express');
const router = express.Router();
const {
  submitMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
  replyToMessage,
  sendDirectMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Public route to submit contact form
router.post('/', submitMessage);

// Private routes for dashboard
router.post('/send', protect, sendDirectMessage);
router.get('/', protect, getMessages);
router.patch('/:id', protect, updateMessageStatus);
router.delete('/:id', protect, deleteMessage);
router.post('/:id/reply', protect, replyToMessage);

module.exports = router;

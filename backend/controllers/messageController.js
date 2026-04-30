const Message = require('../models/Message');
const mailService = require('../services/mailService');

// @desc    Submit a new message (Public)
// @route   POST /api/messages
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage
    });
  } catch (error) {
    console.error('Error in submitMessage:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

// @desc    Get all messages (Private)
// @route   GET /api/messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

// @desc    Update message status (Private)
// @route   PATCH /api/messages/:id
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error('Error in updateMessageStatus:', error);
    res.status(500).json({ message: 'Server error while updating status' });
  }
};

// @desc    Delete a message (Private)
// @route   DELETE /api/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
};

// @desc    Reply to a message (Private)
// @route   POST /api/messages/:id/reply
exports.replyToMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    // Send email
    await mailService.sendReply({
      to: message.email,
      subject: `Re: ${message.subject}`,
      text: text,
    });

    // Update DB
    message.replies.push({ text });
    message.status = 'read'; // Mark as read when replied
    await message.save();

    // Emit Socket Event
    req.io.emit('new_reply', {
      messageId: message._id,
      reply: message.replies[message.replies.length - 1],
      status: message.status
    });

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error in replyToMessage:', error);
    res.status(500).json({ message: 'Server error while sending reply' });
  }
};

// @desc    Send a direct message (Private)
// @route   POST /api/messages/send
exports.sendDirectMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Send email
    await mailService.sendReply({
      to: email,
      subject: subject,
      text: message,
    });

    // Save to DB
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
      type: 'outbound',
      status: 'read'
    });

    // Emit Socket Event
    req.io.emit('new_message', {
      ...newMessage.toObject(),
      id: newMessage._id
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error in sendDirectMessage:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};



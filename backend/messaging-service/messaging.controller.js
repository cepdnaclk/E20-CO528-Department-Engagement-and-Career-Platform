const { Message, Conversation } = require('../shared/models/messaging.model');

const generateRoomId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email profilePhoto role')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ roomId })
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, roomId: customRoomId } = req.body;
    const roomId = customRoomId || generateRoomId(req.user._id.toString(), receiverId);

    const message = new Message({
      sender: req.user._id,
      content,
      roomId,
      readBy: [req.user._id]
    });
    await message.save();
    await message.populate('sender', 'name profilePhoto');

    // Upsert conversation
    let conversation = await Conversation.findOne({ roomId });
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, receiverId],
        roomId,
        lastMessage: content
      });
    } else {
      conversation.lastMessage = content;
    }
    await conversation.save();

    // Emit via Socket.IO if available
    if (req.app.get('io')) {
      req.app.get('io').to(roomId).emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

exports.startConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const roomId = generateRoomId(req.user._id.toString(), participantId);

    let conversation = await Conversation.findOne({ roomId });
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, participantId],
        roomId
      });
      await conversation.save();
    }
    await conversation.populate('participants', 'name email profilePhoto role');
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to start conversation', error: error.message });
  }
};

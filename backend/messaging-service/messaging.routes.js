const express = require('express');
const router = express.Router();
const messagingController = require('./messaging.controller');
const auth = require('../shared/middleware/auth');

router.get('/conversations', auth, messagingController.getConversations);
router.post('/conversations', auth, messagingController.startConversation);
router.get('/:roomId', auth, messagingController.getMessages);
router.post('/', auth, messagingController.sendMessage);

module.exports = router;

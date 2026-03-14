const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const auth = require('../shared/middleware/auth');

router.get('/', auth, notificationsController.getNotifications);
router.put('/:id/read', auth, notificationsController.markAsRead);
router.put('/read-all', auth, notificationsController.markAllAsRead);

module.exports = router;

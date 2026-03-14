const express = require('express');
const router = express.Router();
const eventsController = require('./events.controller');
const auth = require('../shared/middleware/auth');
const roleGuard = require('../shared/middleware/roleGuard');

router.get('/', auth, eventsController.getEvents);
router.post('/', auth, roleGuard('admin', 'alumni'), eventsController.createEvent);
router.get('/:id', auth, eventsController.getEventById);
router.post('/:id/rsvp', auth, eventsController.rsvpEvent);
router.delete('/:id', auth, eventsController.deleteEvent);

module.exports = router;

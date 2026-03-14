const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const auth = require('../shared/middleware/auth');
const roleGuard = require('../shared/middleware/roleGuard');

router.get('/overview', auth, roleGuard('admin'), analyticsController.getOverview);
router.get('/users', auth, roleGuard('admin'), analyticsController.getUserStats);
router.get('/posts', auth, roleGuard('admin'), analyticsController.getPostStats);
router.get('/jobs', auth, roleGuard('admin'), analyticsController.getJobStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const jobsController = require('./jobs.controller');
const auth = require('../shared/middleware/auth');
const roleGuard = require('../shared/middleware/roleGuard');

router.get('/', auth, jobsController.getJobs);
router.post('/', auth, roleGuard('alumni', 'admin'), jobsController.createJob);
router.get('/my-applications', auth, jobsController.getMyApplications);
router.get('/:id', auth, jobsController.getJobById);
router.post('/:id/apply', auth, roleGuard('student'), jobsController.applyForJob);
router.delete('/:id', auth, jobsController.deleteJob);

module.exports = router;

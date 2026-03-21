const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jobsController = require('./jobs.controller');
const auth = require('../shared/middleware/auth');
const roleGuard = require('../shared/middleware/roleGuard');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `cv-${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
});

router.get('/', auth, jobsController.getJobs);
router.post('/', auth, roleGuard('alumni', 'admin'), jobsController.createJob);
router.get('/my-applications', auth, jobsController.getMyApplications);
router.get('/:id', auth, jobsController.getJobById);
router.post('/:id/apply', auth, roleGuard('student'), upload.single('resume'), jobsController.applyForJob);
router.delete('/:id', auth, jobsController.deleteJob);

module.exports = router;

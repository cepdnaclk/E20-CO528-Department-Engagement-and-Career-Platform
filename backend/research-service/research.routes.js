const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const researchController = require('./research.controller');
const auth = require('../shared/middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/', auth, researchController.getProjects);
router.post('/', auth, researchController.createProject);
router.get('/:id', auth, researchController.getProjectById);
router.post('/:id/invite', auth, researchController.inviteCollaborator);
router.post('/:id/documents', auth, upload.single('document'), researchController.uploadDocument);
router.delete('/:id', auth, researchController.deleteProject);

module.exports = router;

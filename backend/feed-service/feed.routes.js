const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const feedController = require('./feed.controller');
const auth = require('../shared/middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', auth, feedController.getPosts);
router.post('/', auth, upload.array('media', 5), feedController.createPost);
router.get('/:id', auth, feedController.getPostById);
router.post('/:id/like', auth, feedController.likePost);
router.post('/:id/comment', auth, feedController.commentOnPost);
router.delete('/:id', auth, feedController.deletePost);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const auth = require('../shared/middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getProfile);
router.put('/me', auth, authController.updateProfile);
router.get('/users', auth, authController.getAllUsers);
router.get('/users/search', auth, authController.searchUsers);
router.get('/users/:id', auth, authController.getUserById);

module.exports = router;

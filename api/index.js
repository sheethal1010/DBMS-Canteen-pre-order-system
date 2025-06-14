const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const menuRoutes = require('./menu');
const orderRoutes = require('./orders');

// Use routes
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
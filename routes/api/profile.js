const express = require('express');
const router = express.Router();

// @route   GET api/profile3
// @desc    Test route
// @access  Public
router.get('/', (req, res)=>res.send('Profile Route'));

module.exports = router;


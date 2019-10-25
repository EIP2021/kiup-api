const express = require('express');

const auth = require('./auth');
const password = require('./password');
const profile = require('./profile');
const stats = require('./stats');

const router = express.Router();

router.use(auth);
router.use(password);
router.use(profile);
router.use(stats);

module.exports = router;

const express = require('express');

const auth = require('./auth');
const password = require('./password');

const router = express.Router();

router.use(auth);
router.use(password);

module.exports = router;

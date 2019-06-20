const express = require('express');

const auth = require('./auth');
const password = require('./password');
const profile = require('./profile');
const stats = require('./stats');
const search = require('./search');
const recipe = require('./recipe');

const router = express.Router();

router.use('/user/', auth);
router.use(password);
router.use(profile);
router.use(stats);
router.use(recipe);

module.exports = router;

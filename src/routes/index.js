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
router.use('/user/', profile);
router.use('/user/', stats);
router.use('/aliment/', search);
router.use('/recipe/', recipe);

module.exports = router;

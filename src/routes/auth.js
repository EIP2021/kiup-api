const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const models = require('../models');
const error = require('../error');
const config = require('../../config.json');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (!req.body || !email || email.trim() === '' || email.match(emailReg) === null) {
    return error(400, 'Invalid email', res);
  }
  if (password.trim() !== '' && password.match(passwordReg) === null) {
    return (error(400, 'Le mot de passe doit contenir au moins 8 caracteres et comporter des lettres majusucules et minuscules ainsi que des chiffres', res));
  }
  try {
    const hash = await bcrypt.hash(password, config.SALT_ROUNDS);
    const user = await models.User.create({
      email,
      password: hash,
      token: null,
      tokenExpires: null,
    });
    if (!user) {
      throw new Error('Couldn\'t create user');
    }
    return res.json({
      error: false,
      message: 'Successfully registered',
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return error(400, 'Invalid request', res);
  }
  const user = await models.User.findOne({
    where: {
      email,
    },
  });
  if (!user) {
    return error(403, 'Invalid email or password', res);
  }
  const cmp = await bcrypt.compare(password, user.password);
  if (!cmp) {
    return error(403, 'Invalid email or password', res);
  }
  res.status(200).json({
    error: false,
    token: jwt.sign({ email, id: user.id }, config.secret),
    user,
  });
  return 0;
});

module.exports = router;

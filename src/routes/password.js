const express = require('express');
const uuid = require('uuid/v4');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const models = require('../models');
const error = require('../error');
const unauth = require('../unauthentified');
const config = require('../../config.json');

const SALT_ROUNDS = 12;
const router = express.Router();
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

router.post('/password/forgot', async (req, res) => {
  const { email } = req.body;
  const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!req.body || !email || email.trim() === '' || email.match(emailReg) === null) {
    return error(400, 'Invalid request', res);
  }
  try {
    const user = await models.User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return error(401, 'User not found', res);
    }
    const token = uuid();
    const tokenExpires = Date.now() + 3600000;
    user.update({
      token,
      tokenExpires,
    });
    const mailOptions = {
      to: email,
      subject: 'Réinitalisation mot de passe KIUP',
      html: `Une demande de réinitalisation de mot de passe a été éffectuée pour votre email.<br></br>
      Cliquez sur le lien ci dessous pour changer votre mot de passe.<br></br>
      <a href="http://localhost:3000/password/reset/${token}">http://localhost:3000/password/reset/${token}</a>`,
    };
    await transport.sendMail(mailOptions);
    return res.status(200).json({
      error: false,
      message: `Un email a été envoyé à ${email} pour reinitialiser le mot de passe.`,
    });
  } catch (err) {
    return error(500, 'Invalid request', res);
  }
});

router.post('/password/reset', async (req, res) => {
  const { token, password } = req.body;
  if (!req.body || !token || !password) {
    return error(400, 'Invalid request', res);
  }
  const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (password.trim() !== '' && password.match(passwordReg) === null) {
    return (error(400, 'Le mot de passe doit contenir au moins 8 caracteres et comporter des lettres majusucules et minuscules ainsi que des chiffres', res));
  }
  try {
    const user = await models.User.findOne({
      where: {
        token,
      },
    });
    if (!user) {
      return error(401, 'Token invalide.', res);
    }
    if (user.tokenExpires < Date.now()) {
      console.log(user.tokenExpires, Date.now());
      return error(401, 'Token expiré.', res);
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await user.update({
      password: hash,
      token: null,
      tokenExpires: null,
    });
    return res.status(200).json({
      error: false,
      message: 'Mot de passe modifié',
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.use(unauth);

module.exports = router;

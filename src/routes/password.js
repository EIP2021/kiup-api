const express = require('express');
const uuid = require('uuid/v4');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const exjwt = require('express-jwt');

const models = require('../models');
const error = require('../error');
const unauth = require('../unauthentified');
const config = require('../../config.json');

const jwtMiddleware = exjwt({
  secret: config.secret,
});

const router = express.Router();
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.password,
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
      <a href="kiup://reset_password?token=${token}">Modifier mon mot de passe</a><br></br>`,
    };
    await transport.sendMail(mailOptions);
    return res.status(200).json({
      error: false,
      message: `Un email a été envoyé à ${email} pour reinitialiser le mot de passe.`,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
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
    const hash = await bcrypt.hash(password, config.SALT_ROUNDS);
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

router.post('/password/change', jwtMiddleware, async (req, res) => {
  const { oldPassword, password } = req.body;
  const { id } = req.user;
  if (!req.body || !oldPassword || !password) {
    return error(400, 'Invalid request', res);
  }
  const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (password.trim() !== '' && password.match(passwordReg) === null) {
    return (error(400, 'Le mot de passe doit contenir au moins 8 caracteres et comporter des lettres majuscules et minuscules ainsi que des chiffres', res));
  }
  try {
    const user = await models.User.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      return error(401, 'Utilisateur introuvable.', res);
    }
    const result = await bcrypt.compare(oldPassword, user.password);
    if (!result) {
      return (error(403, 'Mot de passe invalide', res));
    }
    const hash = await bcrypt.hash(password, config.SALT_ROUNDS);
    await user.update({
      password: hash,
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

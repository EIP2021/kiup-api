const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const models = require('../models');
const error = require('../error');
const config = require('../../config.json');

const router = express.Router();

/**
 * This is an attempt to generate swagger documentation. Todo
 * @route POST /user/register
 * @group User - Operations about user
 * @param {string} email.body.required - Registration email
 * @produces application/json
 * @consumes application/json
 * @returns {object} 200 - {
 *    error: false,
 *    token: 'token',
 * }
 * @returns {Error}  default - Unexpected error
 */
router.post('/register', async (req, res) => {
  const { email, password, info } = req.body;
  const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  if (!req.body || !email || email.trim() === '' || email.match(emailReg) === null) {
    return error(400, 'Adresse email invalide', res);
  }
  if (password.trim() !== '' && password.match(passwordReg) === null) {
    return error(
      400,
      'Le mot de passe doit contenir au moins 8 caracteres et comporter des majuscules, minuscules et chiffres',
      res,
    );
  }
  if (
    !info
    || !info.firstName
    || !info.lastName
    || !info.gender
    || !info.birthdate
    || !info.weight
  ) {
    return error(400, 'Informations supplementaires incomplètes', res);
  }
  try {
    info.dateOfBirth = info.birthdate;
    const user = await models.User.findOne({
      where: {
        email,
      },
    });
    if (user) {
      return error(403, 'Cette adresse email est déjà utilisé', res);
    }
    const hash = await bcrypt.hash(password, config.SALT_ROUNDS);
    const createdUser = await models.User.create({
      email,
      password: hash,
      token: null,
      tokenExpires: null,
    });
    const userInfo = await models.UserInfo.create({
      id: createdUser.id,
      ...info,
    });
    if (!createdUser || !userInfo) {
      throw new Error('Une erreur est survenue lors de la creation du compte');
    }
    return res.json({
      error: false,
      message: 'Enregistré avec succès',
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Erreur interne', res);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return error(400, 'Requete invalide', res);
  }
  const user = await models.User.findOne({
    where: {
      email,
    },
  });
  if (!user) {
    return error(403, 'Email ou mot de passe invalide', res);
  }
  const cmp = await bcrypt.compare(password, user.password);
  if (!cmp) {
    return error(403, 'Email ou mot de passe invalide', res);
  }
  res.status(200).json({
    error: false,
    token: jwt.sign({ email, id: user.id }, config.secret),
    email: user.email,
  });
  return 0;
});

module.exports = router;

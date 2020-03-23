const express = require('express');
const fetch = require('node-fetch');

const models = require('../models');
const error = require('../error');
const unauth = require('../unauthentified');

const router = express.Router();

router.get('/item', async (req, res) => {
  try {
    const result = await models.Aliment.findOne({
      where: {
        alim_image: null,
      },
      raw: true,
    });
    console.log(result);
    const resp = await fetch(`https://api.qwant.com/api/search/images?count=20&q=${result.alim_nom_fr}&uiv=4&t=${result.alim_nom_fr}&size=small&type=transparent`);
    const res1 = await resp.json();
    return res.json({
      error: false,
      alim: result,
      images: res1,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});

router.post('/set', async (req, res) => {
  console.log(req);
  const { alimCode, url } = req.body;
  if (!alimCode || !url) {
    return error(400, 'Invalid request', res);
  }
  try {
    const item = await models.Aliment.findOne({
      where: {
        alim_code: alimCode,
      },
    });
    await item.update({
      alim_image: url,
    });
    return res.json({
      error: false,
    });
  } catch (err) {
    console.error(err);
    return error(500, 'Internal server error', res);
  }
});
router.use(unauth);

module.exports = router;

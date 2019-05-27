const express = require('express');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
const config = require('../config.json');

const app = express();

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  },
}));
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
  next();
});

app.use(routes);

const port = process.env.PORT || config.port;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

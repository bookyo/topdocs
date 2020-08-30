const express = require('express');
const { keystone, apps } = require('./index.js');

keystone
  .prepare({
    apps: apps,
    dev: process.env.NODE_ENV !== 'production',
  })
  .then(async ({ middlewares }) => {
    await keystone.connect();
    const app = express();
    app.set('trust proxy', true);
    app.use(middlewares).listen(3000);
  });
'use strict';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const debug = require('debug')('cfgram:server');

const authRouter = require('./route/auth-router.js');
const albumRouter = require('./route/album-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

mongoose.connect(process.env.MONGODB_URI);

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);
app.use(albumRouter);
app.use(errors);

app.listen(PORT, () => {
  debug(`server up: ${PORT}`);
});

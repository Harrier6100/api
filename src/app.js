const express = require('express');
const cors = require('cors');
const cookie = require('cookie-parser');
const compression = require('compression');
const mongoose = require('mongoose');
const cacheControl = require('@/middlewares/cacheControl');
const accessLogger = require('@/middlewares/accessLogger');
const errorLogger = require('@/middlewares/errorLogger');
const errorHandler = require('@/middlewares/errorHandler');

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.error(err);
    process.exit(1);
});

const corsOptions = {
    origin: process.env.ORIGIN,
    credentials: true,
};

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookie());
app.use(compression());
app.use(cacheControl);
app.use(accessLogger);
app.use('/api', require('@/routes'));
app.use(errorLogger);
app.use(errorHandler);

module.exports = app;
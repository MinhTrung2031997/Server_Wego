const createError = require('http-errors');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users.router');
const verifyRouter = require('./routes/verify.router');
const authRouter = require('./routes/auth.router');
const forgotPasswordRouter = require('./routes/forgotPassword.router');
const sendMailGetCode = require('./routes/sendMailGetCode.router');

const tripRouter = require('./routes/trip.router');
const tripUserRouter = require('./routes/tripUser.router');
const transactionRouter = require('./routes/transaction.router');
const transactionUserRouter = require('./routes/transactionUser.router');
const userActivityRouter = require('./routes/userActivity.router');
const searchRouter = require('./routes/search.router');
const chatRouter = require('./routes/chat.router');
const planUserRouter = require('./routes/planUser.router');
const placeLocationRouter = require('./routes/placeLocation.router');
const imageRouter = require('./routes/image.router');
const locationUser = require('./routes/locationUser.router');

const app = express();

const MONGO_USERNAME = 'myUserAdmin';
const MONGO_PASSWORD = 'minhtrung';
const MONGO_HOSTNAME = '127.0.0.1';
const MONGO_PORT = '27017';
const MONGO_DB = 'wego';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
const url1 = `mongodb://localhost:27017/wego`;

mongoose.Promise = global.Promise;
mongoose.connect(url1, options).then(
  () => {
    console.log('Connected Mongodb');
  },
  (err) => {
    console.log(`err :${err}`);
  },
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/index', indexRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/auth', authRouter);
app.use('/api/forgotPassword', forgotPasswordRouter);
app.use('/api/sendMailGetCode', sendMailGetCode);
app.use('/api/user', usersRouter);
app.use('/api/trip', tripRouter);
app.use('/api/tripUser', tripUserRouter);
app.use('/api/transaction', transactionRouter);
app.use('/api/transactionUser', transactionUserRouter);
app.use('/api/userActivity', userActivityRouter);
app.use('/api/search', searchRouter);
app.use('/api/chat', chatRouter);
app.use('/api/plan', planUserRouter);
app.use('/api/placeLocation', placeLocationRouter);
app.use('/api/image', imageRouter);
app.use('/api/locationUser', locationUser);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

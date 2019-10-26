const createError = require('http-errors');
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
const transactionRouter = require('./routes/transaction.router');
const transactionUserRouter = require('./routes/transactionUser.router');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/wego", { useNewUrlParser: true, useCreateIndex: true }).then(
  () => {
    console.log("Connected Mongodb");
  },
  err => {
    console.log(`err :${err}`);
  }
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/auth', authRouter);
app.use('/api/forgotPassword', forgotPasswordRouter);
app.use('/api/sendMailGetCode', sendMailGetCode);
app.use('/api/user', usersRouter);
app.use('/api/trip', tripRouter);
app.use('/api/transaction', transactionRouter);
app.use('/api/transactionUser', transactionUserRouter);

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

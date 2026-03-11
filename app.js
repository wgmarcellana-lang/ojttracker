var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config({
  path: path.join(__dirname, 'config', '.env')
});

require('./config/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/authRoutes');
var internRouter = require('./routes/internRoutes');
var dailyLogRouter = require('./routes/dailyLogRoutes');
var supervisorRouter = require('./routes/supervisorRoutes');
var adminRouter = require('./routes/adminRoutes');
var reportRouter = require('./routes/reportRoutes');
var { loadCurrentUser } = require('./middleware/authMiddleware');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(loadCurrentUser);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/interns', internRouter);
app.use('/logs', dailyLogRouter);
app.use('/supervisors', supervisorRouter);
app.use('/admin', adminRouter);
app.use('/reports', reportRouter);
app.use('/users', usersRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', {
    pageTitle: 'Application Error'
  });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;

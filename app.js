var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var securityHeaders = require('./middleware/securityHeaders');
var notFound = require('./middleware/notFound');
var errorHandler = require('./middleware/errorHandler');
var { formatLongDate, formatTime12Hour } = require('./utilities/timeUtils');

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
var apiRouter = require('./routes/apiRoutes');
var { loadCurrentUser } = require('./middleware/authMiddleware');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable('x-powered-by');
app.locals.formatDate = formatLongDate;
app.locals.formatTime = formatTime12Hour;

app.use(logger('dev'));
app.use(securityHeaders);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
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
app.use('/api', apiRouter);
app.use('/users', usersRouter);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;

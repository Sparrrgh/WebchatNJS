var express = require('express')
, session = require('express-session')
, auth = require('./middlewares/auth.js')
, passport = auth.passport;

//Setup express
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(session({
    secret: 'who cares', resave: false, saveUninitialized: false 
  }));
app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use(require('./controllers')); 

//Start server
app.listen(8080, function () {
    console.log('Server intialized on port 8080');
});

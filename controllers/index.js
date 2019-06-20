var express = require('express')
  , router = express.Router()
  , path = require('path')
  , users = require('../models/users')
  , auth = require('../middlewares/auth');


var passport = auth.passport;

//I implement the routers for each model
router.use('/chat', require('./messages'));
router.use('/rooms', require('./rooms'));
router.use('/users', require('./users'));

router.get('/', function (req, res) {
    if(req.user){
        res.redirect('/chat');
    } else{
        res.sendFile(path.join(__dirname, '../public/', '/user.html'));
    }
});

router.post('/login',
    passport.authenticate('local'),
    function(req, res) {
        //Upon login the user is automatically sorted in General
        users.updateUserRoom('General', req.user.username, (err) => {
            if(err){
                console.log(err.stack); 
            }
        });
        res.send({redirect: '/chat'});
  });

router.get('/logout', function(req, res){
    //Upon logout the user doesn't have a room anymore
    users.updateUserRoom('', req.user.username, (err) => {
        if(err){
            console.log(err.stack); 
        }
    });
    req.logout();
    res.redirect('/');
});
module.exports = router
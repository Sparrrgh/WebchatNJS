var express = require('express')
  , router = express.Router()
  , users = require('../models/users')
  , auth = require('../middlewares/auth');

router.get('/', auth.isAuthenticated, function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //Fetches all users in the current room
        users.fetchUsersRoom(req.query.room, (err, results) => {
            if (err) {
                console.log(err.stack)
            } else {
                res.json(results);
            }
        });
    }
});

router.post('/', auth.isAuthenticated, function (req, res){
    if(req.xhr){
        //Updates the location of the user
        users.updateUserRoom(req.body.room, req.user.username, (err) => {
            if(err){
                res.sendStatus(500);
                console.log(err.stack); 
            } else{
                res.sendStatus(200);
            }
        });
    }
});


module.exports = router
var express = require('express')
  , router = express.Router()
  , messages = require('../models/messages')
  , auth = require('../middlewares/auth')
  , path = require('path');

router.get('/', auth.isAuthenticated, function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        if (req.query.nu === '1'){
            //If it's the first request it fetches all messages from the current room
            messages.fetchMessagesRoom(req.query.room, (err,results) => {
                if(err){
                    console.log(err.stack);
                } else{
                    res.json(results);
                }
            });
        }
        else{
            //If it's not it returns the last message assuming longpolling
            messages.fetchLastMessage(req.query.room,(err,results) => {
                if(err){
                    console.log(err.stack)
                } else{
                    res.json(results);
                }
            });
        }
    }else{
        //If a request is user-sent, it'll just return the chat's UI
        res.sendFile(path.join(__dirname, '../public/', 'chat.html'));
        console.log('Room served');
    }
});

router.post('/', auth.isAuthenticated,function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        messages.createMessage(req.body.value, req.body.room, req.user.username, (err) => {
            if(err){
                res.sendStatus(400);
            } else{
                res.sendStatus(200);
            }
        });
    }
});

module.exports = router
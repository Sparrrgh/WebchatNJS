const express = require('express')
  , router = express.Router()
  , rooms = require('../models/rooms')
  , auth = require('../middlewares/auth')
  , path = require('path');

router.post('/', auth.isAuthenticated, function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        rooms.createRoom(req.body.name, (err) => {
            if(err){
                res.sendStatus(400);
            } else{
                res.sendStatus(200);
            }
        });
    }
});

router.get('/', auth.isAuthenticated ,function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        if(req.query.nu === '1'){
            //If it's the first request it fetches all rooms
            rooms.fetchRooms((err, results) => {
                if(err){
                    console.log(err.stack);
                } else {
                    res.json(results);
                }
            })
        }else{
            //If it's not it returns the last room assuming longpolling
            rooms.fetchLastRoom((err, results) => {
                if (err) {
                    console.log("Error while fetching last room: " + err.stack);
                } else {
                    res.json(results);
                }
            });
        }
    }
});


module.exports = router
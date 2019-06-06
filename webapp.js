var path = require('path');
var users = require('./models/users.js');
var rooms = require('./models/rooms.js');
var auth = require('./middlewares/auth.js');
var messages = require('./models/messages.js');

var passport = auth.passport;
var express = require('express');
var session = require('express-session')
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(session({
    secret: 'who cares', resave: false, saveUninitialized: false 
  }));
app.use(passport.initialize());
app.use(passport.session());

var EventEmitter = require('events').EventEmitter
var messageBus = new EventEmitter();
messageBus.setMaxListeners(100);
var roomBus = new EventEmitter();
roomBus.setMaxListeners(100);
var userBus = new EventEmitter();
userBus.setMaxListeners(100);

app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
        //DEBUG
        console.log("Trying login");
        users.updateUserRoom('General', req.user.username, (err) => {
            if(err){
                console.log(err.stack); 
            }
        });
        userBus.emit("userSent");
        res.send({redirect: '/chat'});
  });

app.get('/logout', function(req, res){
    users.updateUserRoom('', req.user.username, (err) => {
        if(err){
            console.log(err.stack); 
        }
    });
    userBus.emit("userSent");
    req.logout();
    res.redirect('/');
});

app.get('/', function (req, res) {
    if(req.user){
        res.redirect('/chat');
    } else{
        res.sendFile(path.join(__dirname + '/public/' +'/user.html'));
    }
});


//Controller models
app.post('/register', function (req, res) {
    if(req.xhr){
        users.createUser(req.body.username, req.body.password, (err,results) => {
            if(err){
                res.statusMessage = err;
                res.status(400).end();
            }
        });
    }
});

app.get('/chat', auth.isAuthenticated, function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //Send all messages from the current room
        if (req.query.nu === '1'){
            messages.fetchMessagesRoom(req.query.room, (err,results) => {
                if(err){
                    console.log(err.stack);
                } else{
                    res.json(results);
                }
            });
        }
        else{
            //If it is I'll add a listener to wait for a message
            var addMessageListener = function(res){
                messageBus.once('messageSent', function(data){
                    messages.fetchLastMessage(req.query.room,(err,results) => {
                        if(err){
                            console.log(err.stack)
                        } else{
                            res.json(results);
                        }
                    });
                });
            }
            addMessageListener(res);
            console.log("Added one message listener");
        }
    }else{
        //If a request is user-sent, I'll just return the chats UI
        res.sendFile(path.join(__dirname + '/public/' +'/chat.html'));
        console.log('Room served');
    }
});

app.post('/chat', auth.isAuthenticated,function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //I parse the message and add it to the database
        var messageReceived = req.body;
        messages.createMessage(messageReceived.value, messageReceived.room, req.user.username, (err) => {
            if(err){
                res.sendStatus(400);
            } else{
                res.sendStatus(200);
                //Warns the listeners that a message has been sent
                messageBus.emit('messageSent');
            }
        });
    }
});

//Rooms listener
app.post('/rooms', auth.isAuthenticated, function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        rooms.createRoom(req.body.name, (err) => {
            if(err){
                res.sendStatus(400);
            } else{
                res.sendStatus(200);
                //Warns the listeners that a room has been sent
                roomBus.emit('roomSent');
            }
        });
    }
});


app.get('/rooms',auth.isAuthenticated ,function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        if(req.query.nu === '1'){
            //Send all rooms
            rooms.fetchRooms((err, results) => {
                if(err){
                    console.log(err.stack);
                } else {
                    res.json(results);
                }
            })
        }else{
            //If it is I'll add a listener to wait for a room
            var addRoomListener = function(res){
                roomBus.once('roomSent', function(data){
                    rooms.fetchLastRoom((err, results) => {
                        if (err) {
                            console.log(err.stack);
                        } else {
                            res.json(results);
                        }
                    })
                })
            }
            addRoomListener(res)
            console.log("Added one room listener");
        }
    }
});

app.get('/users', function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //If it is I'll add a listener to wait for a room
        var addUserListener = function(res){
            userBus.once('userSent', function(data){
                users.fetchUsersRoom(req.query.room, (err, results) => {
                    if (err) {
                        console.log(err.stack)
                    } else {
                        res.json(results);
                    }
                });
            })
        }
        addUserListener(res)
        console.log("Added one user listener");
    }
});

app.post('/users', function (req, res){
    if(req.xhr){
        users.updateUserRoom(req.body.room, req.user.username, (err) => {
            if(err){
                res.sendStatus(500);
                console.log(err.stack); 
            } else{
                res.sendStatus(200);
            }
        });
        userBus.emit("userSent");
    }
});

app.listen(8080, function () {
    console.log('Server intialized on port 8080');
});

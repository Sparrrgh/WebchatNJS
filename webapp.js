var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');
var bcrypt = require('bcryptjs');
var session = require('express-session')

var express = require('express');
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

//connection to db
const {Client}=require('pg')
const connectionString='postgressql://postgres:root@localhost:5433/chat_room'
const client=new Client({
    connectionString: connectionString
})
client.connect();


passport.use(new LocalStrategy((username, password, callback) => {
    client.query('SELECT id, username, password FROM users WHERE username=$1', [username], (err, result) => {
      if(err) {
        console.log('Error when selecting user on login  ' + err);
        return callback(err);
      }
  
      if(result.rows.length > 0) {
        const first = result.rows[0];
        bcrypt.compare(password, first.password, function(err, res) {
          if(res) {
            console.log(first.username + ' logged');
            callback(null, { id: first.id, username: first.username });
           } else {
            console.log(err);
            callback(null, false);
           }
         })
       } else {
        console.log('other err');
        callback(null, false);
       }
    });
  }));

passport.serializeUser((user, done) => {
    done(null, user.id);
})
  
passport.deserializeUser((id, callback) => {
    client.query('SELECT id, username FROM users WHERE id = $1', [parseInt(id, 10)], (err, results) => {
        if(err) {
        console.log('Error when selecting user on session deserialize ' + err)
        return callback(err)
        }

        callback(null, results.rows[0])
    })
})

app.post('/register', function (req, res) {
    if(req.xhr){
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);
        client.query('INSERT INTO users(username, password) VALUES($1, $2)', [req.body.username, hash], (err, results) => {
            if(err) {
            console.log('Error when inserting user' + err)
            }
        })
        console.log(req.body.username + ": "+ hash +' saved');
    }
});

app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
        res.send({redirect: '/chat'});
  });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else{ 
        res.redirect('/');
    }
}

app.get('/chat', isAuthenticated, function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //Send all messages from the current room
        if (req.query.nu === '1'){
            const query = {
                // give the query a unique name
                name: 'fetch-messages-room',
                text: 'SELECT * FROM messages WHERE room = $1 ORDER BY time',
                values: [req.query.room]
                }
            client.query(query, (err, table) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    res.json(table.rows);
                }
            });
        }
        else{
            //If it is I'll add a listener to wait for a message
            var addMessageListener = function(res){
                messageBus.once('messageSent', function(data){
                    //When a message is sent I'll return it by taking it from the array
                    //After checking if it is from the current room
                    const query = {
                        // give the query a unique name
                        name: 'fetch-last-message',
                        text: 'SELECT * FROM messages ORDER BY TIME DESC LIMIT 1'
                        }
                    client.query(query, (err, table) => {
                        if (err) {
                            console.log(err.stack)
                        } else {
                            var new_message = table.rows[0];
                            console.log("Message sent in room: " + new_message.room);
                            if(new_message.room === req.query.room){
                                res.json(new_message);
                            } else{
                                res.json("");
                            }
                        }
                    });
                    
                })
            }
            addMessageListener(res)
            console.log("Added one message listener");
        }
    }else{
        //If a request is user-sent, I'll just return the chats UI
        res.sendFile(path.join(__dirname + '/public/' +'/chat.html'));
        console.log('Room served');
    }
});

app.post('/chat', isAuthenticated,function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //I parse the message and add it to the database
        var messageReceived = req.body;
        console.log("sent a message: " + req.user.username);
        //Checks if the message is formed by only spaces through a regex
        if(!(!(messageReceived.value).replace(/\s/g, '').length)){
            const text = 'INSERT INTO messages(value, room ,time, username) VALUES($1, $2, $3, $4)'
            const values = [messageReceived.value,messageReceived.room, messageReceived.time, req.user.username]
            client.query(text, values);
            res.sendStatus(200);
            //Warns the listeners that a message has been sent
            messageBus.emit('messageSent');
        } else {
            //If the message is composed of only spaces I send a Bad Request status code
            res.sendStatus(400); 
        }
    }
});


//Rooms listener

app.post('/rooms',isAuthenticated, function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        var roomReceived = req.body;
        //Checks if the room name is formed by only spaces through a regex
        if(!(!(roomReceived.name).replace(/\s/g, '').length)){
            //I parse the room and add it to the database
            const text = 'INSERT INTO rooms(name) VALUES($1)'
            const values = [roomReceived.name]
            client.query(text, values);
            console.log("Room sent: "+ roomReceived.name);
            res.sendStatus(200);
            //Warns the listeners that a room has been sent
            roomBus.emit('roomSent');
        } else {  
            //If the room name is composed of only spaces I send a Bad Request status code
            res.sendStatus(400);
        }
        
    }
});

app.get('/rooms',isAuthenticated ,function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        if(req.query.nu === '1'){
            //Send all rooms
            const query = {
                // give the query a unique name
                name: 'fetch-rooms',
                text: 'SELECT * FROM rooms'
                }
            client.query(query, (err, table) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    res.json(table.rows);
                }
            });
        }else{
            //If it is I'll add a listener to wait for a room
            var addRoomListener = function(res){
                roomBus.once('roomSent', function(data){
                    //When a room is sent I'll return it by taking it from the array
                    const query = {
                        // give the query a unique name
                        name: 'fetch-last-room',
                        text: 'SELECT * FROM rooms ORDER BY ID DESC LIMIT 1'
                        }
                    client.query(query, (err, table) => {
                        if (err) {
                            console.log(err.stack)
                        } else {
                            //Sends the last room added
                            res.json(table.rows[0]);
                        }
                    });
                })
            }
            addRoomListener(res)
            console.log("Added one room listener");
        }
    }
});

app.get('/', function (req, res) {
    if(req.user){
        res.redirect('/chat');
    } else{
        res.sendFile(path.join(__dirname + '/public/' +'/user.html'));
    }
});


app.listen(8080, function () {
    console.log('Server intialized on port 8080');
});

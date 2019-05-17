var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
var path = require('path');
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

app.get('/chat', function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //Send all messages from the current room
        if (req.query.nu === '1'){
            const query = {
                // give the query a unique name
                name: 'fetch-messages-room',
                text: 'SELECT * FROM messages WHERE room = $1 ',
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
                        text: 'SELECT * FROM messages ORDER BY ID DESC LIMIT 1'
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

app.post('/chat',function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //I parse the message and add it to the database
        var messageReceived = req.body;
        //Checks if the message is formed by only spaces through a regex
        if(!(!(messageReceived.value).replace(/\s/g, '').length)){
            const text = 'INSERT INTO messages(value, room ,time) VALUES($1, $2, $3)'
            const values = [messageReceived.value,messageReceived.room, messageReceived.time]
            client.query(text, values);
            console.log("Message sent: "+ messageReceived);
            res.send("Message sent");
            //Warns the listeners that a message has been sent
            messageBus.emit('messageSent');
        }
        res.send("Message not sent");
    }
});


//Rooms listener

app.post('/rooms',function (req, res) {
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
            res.send("New room created");
            //Warns the listeners that a room has been sent
            roomBus.emit('roomSent');
        } else { 
            res.send("Room not created");
        }
        
    }
});

app.get('/rooms', function (req, res) {
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


app.listen(8080, function () {
    console.log('Server intialized on port 8080');
});

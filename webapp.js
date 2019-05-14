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
client.connect()


//This array is to be exchanged with a DB later on
var messages = [];
var rooms = [];
//---------
function messageObj(value,room,time) {
    this.value= value;
    //this.email = email;
    this.time = time;
    this.room = room;
  }

app.get('/chat', function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        if (req.query.nu === '1'){
            //Send messages from the current room
            var currentMessages = [];
            //Create temporary array with messages from the current room
            messages.forEach(m => {
                if(m.room === req.query.room){
                    currentMessages.push(m);
                }
            });
            res.json(currentMessages);
        }
        else{
            //If it is I'll add a listener to wait for a message
            var addMessageListener = function(res){
                messageBus.once('messageSent', function(data){
                    //When a message is sent I'll return it by taking it from the array
                    //After checking if it is from the current room
                    var new_message = messages[messages.length - 1]
                    console.log("Message sent in room: " + new_message.room);
                    if(new_message.room === req.query.room){
                        res.json(new_message);
                    } else{
                        res.json("");
                    }
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
        //I parse the message and add it to the message array
        var messageReceived = req.body;
        const text = 'INSERT INTO messages(value, room ,time) VALUES($1, $2, $3) RETURNING *'
        const values = [messageReceived.value,messageReceived.room, messageReceived.time]
        client.query(text, values, (err, res) => {
            if (err) {
              console.log(err.stack)
            } else {
              console.log(res.rows[0])
            }
          })
   
        messages.push(messageReceived);
        console.log("Message sent: "+ messageReceived);
        res.send("Sent");
        //Warns the listeners that a message has been sent
        messageBus.emit('messageSent');
    }
});


//Rooms listener

app.post('/rooms',function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //I parse the message and add it to the message array
        var roomReceived = req.body;
        rooms.push(roomReceived);
        console.log("Room sent: "+ roomReceived.room);
        res.send("Sent new room");
        //Warns the listeners that a room has been sent
        roomBus.emit('roomSent');
    }
});

app.get('/rooms', function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        if(req.query.nu === '1'){
            //Send rooms
            res.json(rooms);
        }else{
            //If it is I'll add a listener to wait for a room
            var addRoomListener = function(res){
                roomBus.once('roomSent', function(data){
                    //When a room is sent I'll return it by taking it from the array
                    var new_room = rooms[rooms.length - 1]
                    res.json(new_room);
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

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json())
var path = require('path');
var EventEmitter = require('events').EventEmitter
var messageBus = new EventEmitter();
messageBus.setMaxListeners(100);

//connection to db
const {Client}=require('pg')
const connectionString='postgressql://postgres:root@localhost:5433/chat_room'
const client=new Client({
    connectionString: connectionString
})
client.connect();


//This array is to be exchanged with a DB later on
var messages = [];
//---------
function messageObj(value,room,time) {
    this.value= value;
    //this.email = email;
    this.time = time;
    this.room = room;
  }

app.get('/room', function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        if (req.query.nu === '1'){
            var currentMessages=[]; 
            const query = {
                    // give the query a unique name
                name: 'fetch-room',
                text: 'SELECT * FROM messages WHERE room = $1 ',
                values: [req.query.room]
                }
            client.query(query, (err, k) => {
                if (err) {
                    console.log(err.stack)
                } else {
                    currentMessages=k.rows;
                    res.json(currentMessages);
                }
            });
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
            console.log("Added one listener");
        }
    }else{
        //If a request is user-sent, I'll just return the chats UI
        res.sendFile(path.join(__dirname + '/public/' +'/room.html'));
        console.log('Room served');
    }
});

app.post('/room',function (req, res) {
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



app.listen(8080, function () {
    console.log('Server intialized on port 8080');
});

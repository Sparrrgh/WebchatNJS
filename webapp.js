var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json())
var path = require('path');
var EventEmitter = require('events').EventEmitter
var messageBus = new EventEmitter();
messageBus.setMaxListeners(100);

const pg        = require('pg');
const config = {
    user: 'postgres',
    database: 'messages',
    password: 'root',
    port: 5432
};
// pool takes the object above -config- as parameter
const pool = new pg.Pool(config);
app.get('/', (req, res, next) => {
   pool.connect(function (err, client, done) {
       if (err) {
           console.log("Can not connect to the DB" + err);
       }
      
       client.query('SELECT $1::int AS number', ['1'], function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            console.log("Connect to the DB" );
            res.status(200).send(result.rows);
       })
      
   })
});
app.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});


//This array is to be exchanged with a DB later on
var messages = [];
//---------
function messageObj(value,room) {
    this.value= value;
    //this.user = user;
    //this.time = time;
    this.room = room;
  }

app.get('/room', function (req, res) {
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

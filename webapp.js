var express = require('express');
var app = express();
app.use(express.static('public'));
app.use(express.json())
var path = require('path');
var EventEmitter = require('events').EventEmitter
var messageBus = new EventEmitter();
messageBus.setMaxListeners(100)

//This array is to be exchanged with a DB later on
var messages = [];
//---------

app.get('/room', function (req, res) {
    //Check if it's a XMLHttpRequest
    if(req.xhr){
        //If it is I'll add a listener to wait for a message
        var addMessageListener = function(res){
            messageBus.once('messageSent', function(data){
                //When a message is sent I'll return it by taking it from the array
                res.json(messages[messages.length - 1]);
            })
        }
        addMessageListener(res)
        console.log("Added one listener");
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
        var messageParsed =(req.body).message;
        messages.push(messageParsed);
        console.log("Message sent: "+ messageParsed);
        res.send("Sent");
        //Warns the listeners that a message has been sent
        messageBus.emit('messageSent');
    }
});

app.listen(8080, function () {
    console.log('Server intialized on port 8080');
});

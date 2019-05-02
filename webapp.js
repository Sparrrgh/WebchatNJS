var express = require('express');
var app = express();
app.use(express.static('public'));
app.use(express.json())
var path = require('path');
var EventEmitter = require('events').EventEmitter
var messageBus = new EventEmitter();
messageBus.setMaxListeners(100)

//TMP test
var messages = [];
//---------


app.get('/room', function (req, res) {
    if(req.xhr){
        var addMessageListener = function(res){
            messageBus.once('messageSent', function(data){
                res.json(messages[messages.length - 1]);
            })
        }
        addMessageListener(res)
        console.log("Added one listener");
    }else{
        res.sendFile(path.join(__dirname + '/public/' +'/room.html'));
        console.log('Room served');
    }
});

app.post('/room',function (req, res) {
    if(req.xhr){
        console.log(req.body)
        
        var messageParsed =(req.body).message;
        console.log('parsed ' + messageParsed);
        messages.push(messageParsed);
        console.log("Message sent: "+ messageParsed);
        res.send("Sent");
        //Warns that a message as been sent
        messageBus.emit('messageSent');
    }
});

app.listen(8080, function () {
    console.log('Server intialized on port 8080');
});

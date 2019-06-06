var db = require('./db.js');
var pool = db.pool;
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
 
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);


function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "/" + month + "/" + day + ";" + hour + ":" + min + ":" + sec;
}

function fetchMessagesRoom(room,callback){
    const query = {
        // give the query a unique name
        name: 'fetch-messages-room',
        text: 'SELECT * FROM messages WHERE room = $1 ORDER BY time',
        values: [room]
    }

    pool.query(query, (err, table) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, table.rows);
        }
    });
}


function fetchLastMessage(room,callback){
    //When a message is sent I'll return it by taking it from the db
    //After checking if it is from the current room
    const query = {
        // give the query a unique name
        name: 'fetch-last-message',
        text: 'SELECT * FROM messages ORDER BY TIME DESC LIMIT 1'
        }
    pool.query(query, (err, table) => {
        if (err) {
            callback(err, null)
        } else {
            var new_message = table.rows[0];
            console.log("Message sent in room: " + new_message.room);
            if(new_message.room === room){
                callback(null, new_message);
            } else{
                callback(null, "");
            }
        }
    });
}

function createMessage(value, room, username, callback){
    valueSanitized = DOMPurify.sanitize(value)
    console.log("sent a message: " + username);
    //Checks if the message is formed by only spaces through a regex
    if(!(!(value).replace(/\s/g, '').length)){
        var time=getDateTime();
        const query = {
            // give the query a unique name
            name: 'create-message',
            text: 'INSERT INTO messages(value, room ,time, username) VALUES($1, $2, $3, $4)',
            values : [valueSanitized, room, time, username]
            }
        pool.query(query, (err, table) => {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    } else {
        //If the message is composed of only spaces I send a Bad Request status code
        callback('Bad Request');
    }
}

exports.fetchMessagesRoom = fetchMessagesRoom;
exports.fetchLastMessage = fetchLastMessage;
exports.createMessage = createMessage;
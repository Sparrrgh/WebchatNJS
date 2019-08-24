const db = require('../middlewares/db')
, pool = db.pool;

//DOMPurify setup
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

//Setup event listeners
const EventEmitter = require('events').EventEmitter;
const messageBus = new EventEmitter();
messageBus.setMaxListeners(100);

function getDateTime() {
    let date = new Date();
    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "/" + month + "/" + day + ";" + hour + ":" + min + ":" + sec;
}

function fetchMessagesRoom(room,callback){
    //Fetches all messages from the current room
    const query = {
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
    //Fetches the last message sent
    const query = {
        name: 'fetch-last-message',
        text: 'SELECT * FROM messages ORDER BY TIME DESC LIMIT 1'
        }
    
    //Waits for the event of a room being created
    messageBus.once('messageSent', function(){
        pool.query(query, (err, table) => {
            if (err) {
                callback(err, null)
            } else {
                const new_message = table.rows[0];
                console.log("Message sent in room: " + new_message.room);
                //Checks if the message is from the current room
                if(new_message.room === room){
                    callback(null, new_message);
                } else{
                    callback(null, "");
                }
            }
        });
    });
    console.log("Added one message listener");
}

function createMessage(value, room, username, callback){
    //Sanitized the message value for further use
    const valueSanitized = DOMPurify.sanitize(value)
    //Checks if the message is formed by only spaces through a regex
    if(!(!(value).replace(/\s/g, '').length)){
        const time=getDateTime();
        const query = {
            name: 'create-message',
            text: 'INSERT INTO messages(value, room ,time, username) VALUES($1, $2, $3, $4)',
            values : [valueSanitized, room, time, username]
            }
        pool.query(query, (err, table) => {
            if (err) {
                callback(err);
            } else {
                callback(null);
                //Warns the listeners that a message has been sent
                messageBus.emit('messageSent');
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
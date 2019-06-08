var db = require('../middlewares/db')
, pool = db.pool;

//DOMPurify setup
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

//Setup event listeners
var EventEmitter = require('events').EventEmitter;
var roomBus = new EventEmitter();
roomBus.setMaxListeners(100);

function createRoom(name,callback){
    //Sanitized the room name for further use
    var roomNameSanitized = DOMPurify.sanitize(name)
    //Checks if the room name is formed by only spaces through a regex
    if(!(!roomNameSanitized.replace(/\s/g, '').length)){
        const query = {
            name: 'create-room',
            text: 'INSERT INTO rooms(name) VALUES($1)',
            values : [roomNameSanitized]
            }
        pool.query(query, (err, table) => {
            if (err) {
                callback(err);
            } else {
                console.log("Room sent: "+ roomNameSanitized);
                callback(null);
                //Warns the listeners that a room has been created
                roomBus.emit('roomSent');
            }
        });
    } else {
        //If the room name is composed of only spaces I send a Bad Request status code
        callback('Bad Request');
    }
    
}

function fetchRooms(callback){
    //Fetches all rooms created
    const query = {
        name: 'fetch-rooms',
        text: 'SELECT * FROM rooms'
    }
    pool.query(query, (err, table) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null,table.rows);
        }
    });
}
function fetchLastRoom(callback){
    //Fetches the last room created
    const query = {
        name: 'fetch-last-room',
        text: 'SELECT * FROM rooms ORDER BY ID DESC LIMIT 1'
    }       

    //Waits for the event of a room being created
    roomBus.once('roomSent', function(){
        pool.query(query, (err, table) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, table.rows[0]);
            }
        });
    })
    console.log("Added one room listener");
}

exports.createRoom = createRoom;
exports.fetchRooms = fetchRooms;
exports.fetchLastRoom = fetchLastRoom;
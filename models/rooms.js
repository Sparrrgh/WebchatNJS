var db = require('./db.js');
var pool = db.pool;
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
 
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

function createRoom(name,callback){
    //Sanitized the room name for further use
    var roomNameSanitized = DOMPurify.sanitize(name)
    //Checks if the room name is formed by only spaces through a regex
    if(!(!roomNameSanitized.replace(/\s/g, '').length)){
        const query = {
            // give the query a unique name
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
            }
        });
    } else {
        //If the room name is composed of only spaces I send a Bad Request status code
        callback('Bad Request');
    }
    
}

function fetchRooms(callback){
    //Send all rooms
    const query = {
        // give the query a unique name
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
    //When a room is sent I'll return it by taking it from the db
    const query = {
        // give the query a unique name
        name: 'fetch-last-room',
        text: 'SELECT * FROM rooms ORDER BY ID DESC LIMIT 1'
        }
    pool.query(query, (err, table) => {
        if (err) {
            callback(err, null)
        } else {
            //Sends the last room added
            callback(table.rows[0], null);
        }
    });
}

exports.createRoom = createRoom;
exports.fetchRooms = fetchRooms;
exports.fetchLastRoom = fetchLastRoom;
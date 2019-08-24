const bcrypt = require('bcryptjs');
const db = require('../middlewares/db')
, pool = db.pool;

//DOMPurify setup
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

//Setup event listeners
const EventEmitter = require('events').EventEmitter;
const userBus = new EventEmitter();
userBus.setMaxListeners(100);

function createUser(username, password, callback){
    //Sanitize username for further use
    const sanitizedUsername = DOMPurify.sanitize(username);
    //Checks if password and username are both made of non-space characters
    if((!(!sanitizedUsername.replace(/\s/g, '').length)) && (!(!(password).replace(/\s/g, '').length))){
        //Hash the password before saving it
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const query = {
            name: 'create-user',
            text: 'INSERT INTO users(username, password) VALUES($1, $2)',
            values: [sanitizedUsername, hash]
        }
        pool.query(query, (err, table) => {
            if(err) {
                console.log('Error when inserting user ' + err);
                callback(err,null)
            }
        });
        console.log(sanitizedUsername + ": "+ hash +' saved');
    } else{
        callback("Password or username not valid",null);
    }
}


function fetchUsersRoom(room, callback){
    //Fetches the users in the current room
    const query = {
        name: 'fetch-users-room',
        text: 'SELECT username, room FROM users'
    }
    //Waits for the event of a user entering a room
    userBus.once('userSent', () => {
        pool.query(query, (err, table) => {
            if (err) {
                callback(err,null);
            } else {
                let selectedRows = [];
                (table.rows).forEach(row => {
                    if(row.room === room){
                        selectedRows.push(row);
                    }
                });
                console.log(selectedRows);
                callback(null,selectedRows)
            }
        });
    })
    console.log("Added one user listener");
}

function updateUserRoom(room, username, callback){
    //Updates the user position
    const query = {
        name: 'update-user-room',
        text: 'UPDATE users SET room = $1 WHERE username = $2',
        values : [room, username]
    }
    pool.query(query, (err, table) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
            //Warns the listeners that a user changed position
            userBus.emit("userSent");
        }
    });
}

exports.updateUserRoom = updateUserRoom;
exports.createUser = createUser;
exports.fetchUsersRoom = fetchUsersRoom;
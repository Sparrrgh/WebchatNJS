var db = require('./db.js');
var pool = db.pool;
var bcrypt = require('bcryptjs');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
 
const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);


function createUser(username, password, callback){
    //Sanitize username for further use
    var sanitizedUsername = DOMPurify.sanitize(username);
    //Checks if password and username are both made of non-space characters
    if((!(!sanitizedUsername.replace(/\s/g, '').length)) && (!(!(password).replace(/\s/g, '').length))){
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        const query = {
            // give the query a unique name
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
        // give the query a unique name
        name: 'fetch-users-room',
        text: 'SELECT username, room FROM users'
    }
    pool.query(query, (err, table) => {
        if (err) {
            callback(err,null);
        } else {
            var selectedRows = [];
            (table.rows).forEach(row => {
                if(row.room === room){
                    selectedRows.push(row);
                }
            });
            console.log(selectedRows);
            callback(null,selectedRows)
        }
    });
}

function updateUserRoom(room, username, callback){
    //Updates the user position
    const query = {
        // give the query a unique name
        name: 'update-user-room',
        text: 'UPDATE users SET room = $1 WHERE username = $2',
        values : [room, username]
    }
    pool.query(query, (err, table) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

exports.updateUserRoom = updateUserRoom;
exports.createUser = createUser;
exports.fetchUsersRoom = fetchUsersRoom;
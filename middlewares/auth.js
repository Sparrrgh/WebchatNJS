var passport = require('passport')
, bcrypt = require('bcryptjs')
, LocalStrategy = require('passport-local').Strategy;

var db = require('./db')
, pool = db.pool;

//New local strategy to authenticate using username and password
passport.use(new LocalStrategy((username, password, callback) => {
  const query = {
    name: 'search-user',
    text: 'SELECT id, username, password FROM users WHERE username=$1',
    values: [username]
  }
  pool.query(query, (err, table) => {
      if(err) {
        console.log('Error when selecting user on login  ' + err);
        return callback(err);
      } else {
        if(table.rows.length > 0) {
          const first = table.rows[0];
          //Comparing hashes
          bcrypt.compare(password, first.password, function(err, res) {
            if(res) {
              console.log(first.username + ' logged');
              callback(null, { id: first.id, username: first.username });
            } else {
              console.log(err);
              callback(null, false);
            }
          });
        } else {
          callback(null, false);
        }
      }
    });
  }));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser((id, callback) => {
    pool.query('SELECT id, username FROM users WHERE id = $1', [parseInt(id, 10)], (err, results) => {
        if(err) {
        console.log('Error when selecting user on session deserialize ' + err)
        return callback(err)
        }

        callback(null, results.rows[0])
    })
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next();
    } else{
        res.redirect('/');
    }
}

exports.isAuthenticated = isAuthenticated;
exports.passport = passport;
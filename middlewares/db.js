//connection to db
const {Pool}=require('pg')
exports.pool=new Pool({
    user: 'webapp',
    host: 'localhost',
    database: 'webapp',
    password: 'webapp',
    port: 5432
});

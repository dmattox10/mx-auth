const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = require('../env')
const knex = require('knex')

const options = {
    client: 'mysql2',
    connection: {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME
    }
}

let knex_conn

async function connectDB(options=options) {
   
    knex_conn = knex(options);
    return knex_conn;
}

module.exports = connectDB
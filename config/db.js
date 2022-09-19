const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = require('../env')
const knex = require('knex')

const OPTIONS = {
  client: 'mysql2',
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME
  }
}

let knexConn

async function connectDB (options = OPTIONS) {
  knexConn = knex(options)
  return knexConn
}

module.exports = connectDB

import { ENVIRONMENT } from '../env'

const environment = ENVIRONMENT || 'development'
const config = require('../knexfile.js')[environment]
module.exports = require('knex')(config)
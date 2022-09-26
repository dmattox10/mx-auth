exports.up = function (knex, Promise) {
    return knex.schema.createTable('users', table => {
      table.increments('id').primary().notNullable()
      table.string('userCuid').unique().notNullable()
      table.string('email').unique().notNullable()
      table.string('hashedPassword').notNullable()
      table.specificType('portals', 'text ARRAY')
      table.timestamps(true, true)
    })
  }
  
  exports.down = function (knex, Promise) {
    return knex.schema.dropTable('users')
  }
  
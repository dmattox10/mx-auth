export const up = function (knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary().notNullable()
    table.string('username').unique().notNullable()
    table.string('salt').notNullable()
    table.string('hash').notNullable()

    table.timestamps(true, true)
  })
}

export const down = function (knex, Promise) {
  return knex.schema.dropTable('users')
}

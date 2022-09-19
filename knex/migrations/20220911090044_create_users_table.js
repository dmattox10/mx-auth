export const up = function (knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments()
    table.string('username').notNullable()
    table.string('password').notNullable()
    table.string('app_name').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

export const down = function (knex, Promise) {
  return knex.schema.dropTable('users')
}

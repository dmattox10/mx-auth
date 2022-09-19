export const up = function (knex, Promise) {
  return knex.schema.createTable('portals', function (table) {
    table.increments()
    table.string('app_name').notNullable()
    table.integer('registered_users').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

export const down = function (knex, Promise) {
  return knex.schema.dropTable('portals')
}

export const up = function (knex, Promise) {
  return knex.schema.createTable('tokens', table => {
    table.increments('id').primary().notNullable()
    table
      .integer('userId')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      .notNullable()
    table.string('activeToken').unique().notNullable()

    table.timestamps(true, true)
  })
}

export const down = function (knex, Promise) {
  return knex.schema.dropTable('tokens')
}

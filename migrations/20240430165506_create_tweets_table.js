/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable("tweets", (table) => {
    table.increments("id").primary()
    table.integer("user_id")
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
    table.string("content", 280).notNullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable("tweets")
}

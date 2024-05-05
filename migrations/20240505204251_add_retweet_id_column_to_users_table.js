/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.alterTable("tweets", (table) => {
    table
      .integer("retweet_id")
      .unsigned()
      .references("id")
      .inTable("tweets")
      .nullable()
      .onDelete("SET NULL")
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.alterTable("tweets", (table) => {
    table.dropColumn("retweet_id")
  })
}

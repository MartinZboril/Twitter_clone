/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.alterTable("tweets", (table) => {
    table
      .dateTime("created_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP"))
    table
      .dateTime("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP"))
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.alterTable("tweets", (table) => {
    table.dropColumn("created_at")
    table.dropColumn("updated_at")
  })
}

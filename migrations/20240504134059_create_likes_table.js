/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable("likes", function (table) {
    table.increments("id").primary()
    table
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
    table.integer("likeable_id").unsigned().notNullable()
    table.string("likeable_type").notNullable()

    // Index to improve performance on polymorphic queries
    table.index(["likeable_id", "likeable_type"])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function (knex) {
  return knex.schema.dropTable("likes")
}

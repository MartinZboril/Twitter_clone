
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.string('bio').nullable()
        table.string('salt').notNullable()
        table.string('hash').notNullable()
        table.string('token').notNullable()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.dropTable('users')
};

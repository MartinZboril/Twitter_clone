import knex from "knex"
import knexfile from "../knexfile.js"

const env = process.env.NODE_ENV ?? "development"

export const db = knex(knexfile[env])
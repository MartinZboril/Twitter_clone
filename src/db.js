import Knex from "knex"
import { Model } from "objection"
import knexConfig from "../knexfile.js"

const environment = process.env.NODE_ENV || "development"
const config = knexConfig[environment]

const db = Knex(config)

Model.knex(db)

export default db

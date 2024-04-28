import knex from "knex"
import knexfile from "../knexfile.js"
import crypto from 'crypto'

const env = process.env.NODE_ENV ?? "development"

export const db = knex(knexfile[env])

export const createUser = async (email, password, name, bio) => {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    const token = crypto.randomBytes(16).toString('hex')

    const [user] = await db('users').insert({ name, bio, salt, hash, token, email }).returning('*')

    return user
}

export const getUser = async (email, password) => {
    const user = await db('users').where({ email }).first()

    if (!user) return null

    const salt = user.salt
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')

    if (hash !== user.hash) return null

    return user
}

export const getUserByToken = async (token) => {
    return db('users').where({ token }).first();
}
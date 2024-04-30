import crypto from 'crypto'
import db from "../db.js"

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
    return db('users').where({ token }).first()
}

export const updateUser = async (id, email, name, bio) => {
    const [user] = await db('users').where({ id }).update({ name, bio, email }).returning('*')

    return user
}

export const changeUserPassword = async (id, password) => {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    const token = crypto.randomBytes(16).toString('hex')

    const [user] = await db('users').where({ id }).update({ salt, hash, token }).returning('*')

    return user
}
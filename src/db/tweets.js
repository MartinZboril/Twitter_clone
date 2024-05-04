import db from "../db.js"
import crypto from "crypto"

export const createTweet = async (content, userId) => {
  await db("tweets")
    .insert({ content, user_id: userId })
    .returning("*")
}

export const updateTweet = async (id, content) => {
  await db("tweets").where({ id }).update({ content })
}

export const deleteTweet = async (id) => {
  await db("tweets").delete().where({ id })
}

export const getAllTweets = async () => {
  return await db("tweets").select("*")
}

export const getTweetById = async (id) => {
  return await db("tweets")
    .select("*")
    .where("id", id)
    .first()
}

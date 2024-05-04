import db from "../db.js"

export const getAllTweets = async () => {
  return await db("tweets").select("*")
}

export const getTweetById = async (id) => {
  return await db("tweets")
    .select("*")
    .where("id", id)
    .first()
}

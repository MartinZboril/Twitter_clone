import db from "../db.js"

export const createTweet = async (content, userId) => {
  const [newTweet] = await db("tweets")
    .insert({ content, user_id: userId })
    .returning("*")
  newTweet.likes = 0
  return newTweet
}

export const updateTweet = async (id, content) => {
  await db("tweets").where({ id }).update({ content })
  return getTweetById(id)
}

export const deleteTweet = async (id) => {
  await db("tweets").where({ id }).delete()
}

export const getAllTweets = async () => {
  const tweets = await db("tweets").select("*")
  for (let tweet of tweets) {
    tweet.likes = await getLikesCount(tweet.id)
  }
  return tweets
}

export const getTweetById = async (id) => {
  const tweet = await db("tweets")
    .select("*")
    .where("id", id)
    .first()
  if (tweet) {
    tweet.likes = await getLikesCount(tweet.id)
  }
  return tweet
}

export const addLike = async (userId, tweetId) => {
  const exists = await db("likes")
    .where({
      user_id: userId,
      likeable_id: tweetId,
      likeable_type: "tweets",
    })
    .first()

  if (!exists) {
    return db("likes").insert({
      user_id: userId,
      likeable_id: tweetId,
      likeable_type: "tweets",
    })
  }
}

export const removeLike = (userId, tweetId) => {
  return db("likes")
    .where({
      user_id: userId,
      likeable_id: tweetId,
      likeable_type: "tweets",
    })
    .del()
}

const getLikesCount = async (id) => {
  const result = await db("likes")
    .where({
      likeable_id: id,
      likeable_type: "tweets",
    })
    .count()

  return parseInt(result[0]["count(*)"], 10)
}

export const hasUserLikedTweet = async (
  tweetId,
  userId,
) => {
  const result = await db("likes")
    .where({
      likeable_id: tweetId,
      likeable_type: "tweets",
      user_id: userId,
    })
    .first()
  return !!result
}

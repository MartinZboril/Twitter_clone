import { getTweetById } from "../db/tweets.js"

export const tweetBelongsToCurrentUser = async (
  req,
  res,
  next,
) => {
  const tweet = await getTweetById(req.params.id)
  if (tweet.user_id === res.locals.user.id) return next()
  res.redirect("/")
}

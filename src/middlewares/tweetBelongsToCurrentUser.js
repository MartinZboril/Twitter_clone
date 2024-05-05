import Tweet from "../models/tweet.js"

export const tweetBelongsToCurrentUser = async (
  req,
  res,
  next,
) => {
  const tweet = await Tweet.query().findById(req.params.id)
  if (tweet.user_id === res.locals.user.id) return next()
  res.redirect("/")
}

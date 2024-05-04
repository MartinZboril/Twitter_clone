import { Router } from "express"
import {
  sendTweetDeletedToAllConnections,
  sendTweetDetailToAllConnections,
  sendTweetListToAllConnections,
} from "../websockets.js"
import {
  createTweet,
  deleteTweet,
  getTweetById,
  updateTweet,
  addLike,
  removeLike,
  hasUserLikedTweet,
} from "../db/tweets.js"
import { authorized } from "../middlewares/authorized.js"
import { tweetBelongsToCurrentUser } from "../middlewares/tweetBelongsToCurrentUser.js"

export const tweetsRouter = new Router()

tweetsRouter.get(
  "/tweet/:id",
  authorized,
  async (req, res, next) => {
    const tweet = await getTweetById(req.params.id)

    if (!tweet) return next()

    tweet.userLiked = await hasUserLikedTweet(
      tweet.id,
      res.locals.user.id,
    )

    res.render("tweets/tweet", {
      title: "Tweet",
      tweet,
    })
  },
)

tweetsRouter.post(
  "/add-tweet",
  authorized,
  async (req, res) => {
    const content = req.body.content
    const userId = res.locals.user.id

    const tweet = await createTweet(content, userId)
    await sendTweetListToAllConnections()
    res.redirect("/")
  },
)

tweetsRouter.post(
  "/update-tweet/:id",
  authorized,
  tweetBelongsToCurrentUser,
  async (req, res, next) => {
    const tweet = await getTweetById(req.params.id)
    if (!tweet) return next()

    await updateTweet(tweet.id, req.body.content)
    await sendTweetDetailToAllConnections(tweet.id)
    res.redirect("back")
  },
)

tweetsRouter.get(
  "/remove-tweet/:id",
  authorized,
  tweetBelongsToCurrentUser,
  async (req, res) => {
    const tweet = await getTweetById(req.params.id)
    if (!tweet) return next()

    await deleteTweet(tweet.id)
    await sendTweetDeletedToAllConnections(tweet.id)
    res.redirect("/")
  },
)

tweetsRouter.post(
  "/like-tweet/:id",
  authorized,
  async (req, res) => {
    const userId = res.locals.user.id
    const tweetId = req.params.id

    await addLike(userId, tweetId)
    res.redirect("back")
  },
)
tweetsRouter.post(
  "/unlike-tweet/:id",
  authorized,
  async (req, res) => {
    const userId = res.locals.user.id
    const tweetId = req.params.id

    await removeLike(userId, tweetId)
    res.redirect("back")
  },
)

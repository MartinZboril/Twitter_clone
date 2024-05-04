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

    await createTweet(content, userId)

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

    await sendTweetListToAllConnections()
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

    await sendTweetListToAllConnections()
    await sendTweetDeletedToAllConnections(tweet.id)

    res.redirect("/")
  },
)

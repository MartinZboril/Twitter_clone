import { Router } from "express"
import {
  sendTweetDeletedToAllConnections,
  sendTweetDetailToAllConnections,
  sendTweetListToAllConnections,
} from "../websockets.js"
import { getTweetById } from "../db/tweets.js"
import { authorized } from "../middlewares/authorized.js"
import { tweetBelongsToCurrentUser } from "../middlewares/tweetBelongsToCurrentUser.js"
import db from "../db.js"

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
    const tweet = {
      content: req.body.content,
      user_id: res.locals.user.id,
    }

    await db("tweets").insert(tweet)

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

    const query = db("tweets").where("id", tweet.id)

    if (req.body.content) {
      query.update({ content: req.body.content })
    }

    await query

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

    await db("tweets").delete().where("id", tweet.id)

    await sendTweetListToAllConnections()
    await sendTweetDeletedToAllConnections(tweet.id)

    res.redirect("/")
  },
)

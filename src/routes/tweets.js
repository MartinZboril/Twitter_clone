import { Router } from "express"
import { authorized } from "../middlewares/authorized.js"
import { tweetBelongsToCurrentUser } from "../middlewares/tweetBelongsToCurrentUser.js"
import Tweets from "../controllers/tweets.js"

export const tweetsRouter = new Router()
const tweetsController = new Tweets()

tweetsRouter.get(
  "/tweet/:id",
  tweetsController.show.bind(tweetsController),
)

tweetsRouter.post(
  "/add-tweet",
  tweetsController.create.bind(tweetsController),
)

tweetsRouter.post(
  "/update-tweet/:id",
  authorized,
  tweetBelongsToCurrentUser,
  tweetsController.update.bind(tweetsController),
)

tweetsRouter.get(
  "/remove-tweet/:id",
  authorized,
  tweetBelongsToCurrentUser,
  tweetsController.remove.bind(tweetsController),
)

tweetsRouter.post(
  "/like-tweet/:id",
  authorized,
  tweetsController.like.bind(tweetsController),
)

tweetsRouter.post(
  "/unlike-tweet/:id",
  authorized,
  tweetsController.unlike.bind(tweetsController),
)

tweetsRouter.post(
  "/tweet/:id/comment",
  authorized,
  tweetsController.addComment.bind(tweetsController),
)

tweetsRouter.post(
  "/retweet/:id",
  authorized,
  tweetsController.retweet.bind(tweetsController),
)

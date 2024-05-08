import { Router } from "express"
import { authorized } from "../middlewares/authorized.js"
import { tweetBelongsToCurrentUser } from "../middlewares/tweetBelongsToCurrentUser.js"
import Tweets from "../controllers/tweets.js"
import { body } from "express-validator"
import { handleErrorMessages } from "../middlewares/handleErrorMessages.js"
import { handleFlashMessages } from "../middlewares/handleFlashMessages.js"

export const tweetsRouter = new Router()
const tweetsController = new Tweets()

tweetsRouter.get(
  "/tweet/:id",
  handleErrorMessages,
  handleFlashMessages,
  tweetsController.show.bind(tweetsController),
)

tweetsRouter.post(
  "/add-tweet",
  [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Tweet content is required")
      .isLength({ max: 280 })
      .withMessage(
        "Tweet content must be less than 280 characters",
      ),
  ],
  tweetsController.create.bind(tweetsController),
)

tweetsRouter.post(
  "/update-tweet/:id",
  [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Tweet content is required")
      .isLength({ max: 280 })
      .withMessage(
        "Tweet content must be less than 280 characters",
      ),
  ],
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
  [
    body("comment")
      .trim()
      .notEmpty()
      .withMessage("Comment content is required")
      .isLength({ max: 280 })
      .withMessage(
        "Comment must be less than 65553 characters",
      ),
  ],
  authorized,
  tweetsController.addComment.bind(tweetsController),
)

tweetsRouter.post(
  "/retweet/:id",
  authorized,
  tweetsController.retweet.bind(tweetsController),
)

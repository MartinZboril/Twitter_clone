import Tweet from "../models/tweet.js"
import Comment from "../models/comment.js"
import {
  sendTweetDeletedToAllConnections,
  sendTweetDetailToAllConnections,
  sendTweetListToAllConnections,
} from "../websockets.js"
import Like from "../models/like.js"

export default class Tweets {
  async show(req, res, next) {
    const tweet = await Tweet.query()
      .findById(req.params.id)
      .withGraphFetched("[author, likes, comments.author]")

    if (!tweet) return next()

    res.render("tweets/tweet", {
      title: "Tweet",
      tweet,
    })
  }

  async create(req, res) {
    const content = req.body.content
    const userId = res.locals.user.id

    const tweet = await Tweet.query().insertAndFetch({
      content: content,
      user_id: userId,
    })

    await sendTweetListToAllConnections(res.locals.user.id)
    res.redirect("/")
  }

  async update(req, res, next) {
    const tweet = await Tweet.query().patchAndFetchById(
      req.params.id,
      { content: req.body.content },
    )

    if (!tweet) return next()

    await sendTweetDetailToAllConnections(
      tweet.id,
      res.locals.user.id,
    )
    res.redirect("back")
  }

  async remove(req, res) {
    const tweet = await Tweet.query().findById(
      req.params.id,
    )

    if (!tweet) return next()

    await Tweet.query().deleteById(tweet.id)
    await sendTweetDeletedToAllConnections(tweet.id)
    res.redirect("/")
  }

  async like(req, res) {
    const userId = res.locals.user.id
    const tweetId = parseInt(req.params.id)

    const likeExists = await Like.query().findOne({
      user_id: userId,
      likeable_id: tweetId,
      likeable_type: "tweet",
    })
    if (!likeExists) {
      await Like.query().insert({
        user_id: userId,
        likeable_id: tweetId,
        likeable_type: "tweet",
      })
    }

    res.redirect("back")
  }

  async unlike(req, res) {
    const userId = res.locals.user.id
    const tweetId = parseInt(req.params.id)

    await Like.query().delete().where({
      user_id: userId,
      likeable_id: tweetId,
      likeable_type: "tweet",
    })

    res.redirect("back")
  }

  async addComment(req, res) {
    const content = req.body.content
    const tweetId = req.params.id
    const userId = res.locals.user.id

    await Comment.query().insert({
      tweet_id: tweetId,
      user_id: userId,
      content,
    })

    res.redirect(`/tweet/${tweetId}`)
  }
}

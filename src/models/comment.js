import { Model } from "objection"
import Tweet from "./tweet.js"
import User from "./user.js"

class Comment extends Model {
  static get tableName() {
    return "comments"
  }

  static get relationMappings() {
    return {
      tweet: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tweet,
        join: {
          from: "comments.tweet_id",
          to: "tweets.id",
        },
      },
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "comments.user_id",
          to: "users.id",
        },
      },
    }
  }
}

export default Comment

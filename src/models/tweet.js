import { Model } from "objection"
import moment from "moment"
import User from "./user.js"
import Like from "./like.js"
import Comment from "./comment.js"

class Tweet extends Model {
  static get tableName() {
    return "tweets"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["user_id"],
      properties: {
        id: { type: "integer" },
        user_id: { type: "integer" },
        content: {
          type: ["string", "null"],
          maxLength: 280,
        },
        retweet_id: { type: ["integer", "null"] },
      },
    }
  }

  static get virtualAttributes() {
    return ["likesCount", "postedOn"]
  }

  static get relationMappings() {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tweets.user_id",
          to: "users.id",
        },
      },
      likes: {
        relation: Model.HasManyRelation,
        modelClass: Like,
        join: {
          from: "tweets.id",
          to: "likes.likeable_id",
          filter: (builder) =>
            builder.where("likes.likeable_type", "tweet"),
        },
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: "tweets.id",
          to: "comments.tweet_id",
        },
      },
      retweets: {
        relation: Model.HasManyRelation,
        modelClass: Tweet,
        join: {
          from: "tweets.id",
          to: "tweets.retweet_id",
        },
      },
    }
  }

  get likesCount() {
    return this.likes ? this.likes.length : 0
  }

  get postedOn() {
    return moment(this.created_at).fromNow()
  }

  userHasLiked(userId) {
    return this.likes
      ? this.likes.some((like) => like.user_id === userId)
      : false
  }
}

export default Tweet

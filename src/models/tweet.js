import { Model } from "objection"
import User from "./user.js"
import Like from "./like.js"
import Comment from "./comment.js"

class Tweet extends Model {
  static get tableName() {
    return "tweets"
  }

  static get virtualAttributes() {
    return ["likesCount"]
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
    }
  }

  get likesCount() {
    return this.likes ? this.likes.length : 0
  }

  userHasLiked(userId) {
    return this.likes
      ? this.likes.some((like) => like.user_id === userId)
      : false
  }
}

export default Tweet

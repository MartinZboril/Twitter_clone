import { Model } from "objection"
import User from "./user.js"
import Tweet from "./tweet.js"

class Like extends Model {
  static get tableName() {
    return "likes"
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["likeable_id", "likeable_type", "user_id"],
      properties: {
        likeable_id: { type: "integer" },
        likeable_type: {
          type: "string",
          enum: ["tweet", "comment"],
        },
        user_id: { type: "integer" },
      },
    }
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "likes.user_id",
          to: "users.id",
        },
      },
      tweet: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tweet,
        join: {
          from: "likes.likeable_id",
          to: "tweets.id",
          filter: (builder) =>
            builder.where("likes.likeable_type", "tweet"),
        },
      },
    }
  }
}

export default Like

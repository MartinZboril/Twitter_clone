import { Model } from "objection"
import User from "./user.js"

class Follow extends Model {
  static get tableName() {
    return "follows"
  }

  static get idColumn() {
    return ["follower_id", "followee_id"]
  }

  static get relationMappings() {
    return {
      follower: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "follows.follower_id",
          to: "users.id",
        },
      },
      followee: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "follows.followee_id",
          to: "users.id",
        },
      },
    }
  }
}

export default Follow

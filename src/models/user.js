import { Model } from "objection"
import Tweet from "./tweet.js"
import Like from "./like.js"
import crypto from "crypto"

class User extends Model {
  static get tableName() {
    return "users"
  }

  static get relationMappings() {
    return {
      tweets: {
        relation: Model.HasManyRelation,
        modelClass: Tweet,
        join: {
          from: "users.id",
          to: "tweets.user_id",
        },
      },
      likes: {
        relation: Model.HasManyRelation,
        modelClass: Like,
        join: {
          from: "users.id",
          to: "likes.user_id",
        },
      },
    }
  }

  static hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex")
    const token = crypto.randomBytes(16).toString("hex")
    return { salt, hash, token }
  }

  static verifyPassword(password, salt, hash) {
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex")
    return hash === computedHash
  }

  static async updatePassword(newPassword) {
    const { salt, hash, token } =
      await User.hashPassword(newPassword)
    await this.query().patch({ salt, hash, token })
  }

  static async findByToken(token) {
    return this.query().findOne({ token })
  }
}

export default User

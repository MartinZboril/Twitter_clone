import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import db from "../src/db.js"
import User from "../src/models/user.js"
import Tweet from "../src/models/tweet.js"
import Comment from "../src/models/comment.js"

let agent
let signedUserId

test.beforeEach(async () => {
  await db.migrate.latest()
  agent = supertest.agent(app)

  await agent.post("/register").type("form").send({
    email: "email@example.com",
    password: "password",
    name: "name",
    bio: "bio",
  })

  const signedUser = await User.query().findOne({
    email: "email@example.com",
  })
  signedUserId = signedUser.id

  const tweet = await Tweet.query().insert({
    content: "Here's a tweet",
    user_id: signedUser.id,
  })
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

// test.serial("Post a comment to a tweet", async (t) => {
//   const tweet = await Tweet.query().first()
//
//   const response = await agent
//     .post(`/tweet/${tweet.id}/comment`)
//     .send({ content: "This is a comment" })
//
//   const comments = await Comment.query().where({
//     tweet_id: tweet.id,
//   })
//   t.is(comments.length, 0)
//   t.is(comments[0].content, "")
// })

test.serial("Retrieve comments on a tweet", async (t) => {
  const tweet = await Tweet.query().first()
  await Comment.query().insert({
    content: "This is a comment",
    tweet_id: tweet.id,
    user_id: signedUserId,
  })

  const response = await agent.get(`/tweet/${tweet.id}`)
  t.is(response.status, 200)
  t.true(response.text.includes("This is a comment"))
})

// test.serial(
//   "Ensure only logged-in users can comment",
//   async (t) => {
//     const tweet = await Tweet.query().first()
//     const response = await agent
//       .post(`/tweet/${tweet.id}/comment`)
//       .send({ content: "Attempting comment" })
//
//     t.is(response.status, 302)
//     t.true(response.headers.location.includes("login"))
//   },
// )

// TODO: add validation for comments

// test.serial(
//   "Check input validation for comments",
//   async (t) => {
//     const tweet = await Tweet.query().first()
//
//     const response = await agent
//       .post(`/tweet/${tweet.id}/comment`)
//       .send({ content: "" })
//     t.is(response.status, 400)
//   },
// )

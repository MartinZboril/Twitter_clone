import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import db from "../src/db.js"
import Tweet from "../src/models/tweet.js"
import User from "../src/models/user.js"

let agent
let userId

test.beforeEach(async () => {
  await db.migrate.latest()

  agent = supertest.agent(app)

  const { salt, hash, token } =
    await User.hashPassword("password")
  const newUser = await User.query().insert({
    email: "email@example.com",
    hash,
    salt,
    name: "name",
    bio: "bio",
    token,
  })

  userId = newUser.id

  await agent.post("/login").type("form").send({
    email: "email@example.com",
    password: "password",
  })
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial("create new tweet via form", async (t) => {
  const response = await agent
    .post("/add-tweet")
    .type("form")
    .send({ content: "My tweet" })
    .expect(302)

  const tweet = await Tweet.query().findOne({
    content: "My tweet",
    user_id: userId,
  })
  t.truthy(tweet)
  t.is(tweet.content, "My tweet")
})

test.serial("it renders a list of tweets", async (t) => {
  await Tweet.query().insert({
    content: "My tweet",
    user_id: userId,
  })

  const response = await agent.get("/")
  t.assert(response.text.includes("My tweet"))
})

test.serial("tweet detail", async (t) => {
  const tweet = await Tweet.query().insert({
    content: "My tweet",
    user_id: userId,
  })

  const response = await agent.get(`/tweet/${tweet.id}`)
  t.assert(response.text.includes("My tweet"))
})

test.serial("update tweet via form", async (t) => {
  const tweet = await Tweet.query().insert({
    content: "My tweet",
    user_id: userId,
  })

  await agent
    .post(`/update-tweet/${tweet.id}`)
    .type("form")
    .send({ content: "Your tweet" })
    .expect(302)

  const updatedTweet = await Tweet.query().findById(
    tweet.id,
  )
  t.is(updatedTweet.content, "Your tweet")
})

test.serial("remove tweet", async (t) => {
  const tweet = await Tweet.query().insert({
    content: "My tweet",
    user_id: userId,
  })

  await agent.get(`/remove-tweet/${tweet.id}`).expect(302)

  const deletedTweet = await Tweet.query().findById(
    tweet.id,
  )
  t.falsy(deletedTweet)
})

test.serial("like and unlike a tweet", async (t) => {
  const tweet = await Tweet.query().insert({
    content: "A tweet to like",
    user_id: userId,
  })

  await agent.post(`/like-tweet/${tweet.id}`).expect(302)
  let likes = await db("likes").where({
    likeable_id: tweet.id,
  })
  t.is(likes.length, 1)

  await agent.post(`/unlike-tweet/${tweet.id}`).expect(302)
  likes = await db("likes").where({ likeable_id: tweet.id })
  t.is(likes.length, 0)
})

test.serial("tweet detail shows like status", async (t) => {
  const tweet = await Tweet.query().insert({
    content: "Tweet to check like status",
    user_id: userId,
  })

  await db("likes").insert({
    user_id: userId,
    likeable_id: tweet.id,
    likeable_type: "tweets",
  })

  const response = await agent.get(`/tweet/${tweet.id}`)
  t.assert(response.text.includes("unlike"))
})

// TODO: retweet tweet

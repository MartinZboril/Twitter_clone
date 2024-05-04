import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import db from "../src/db.js"

let agent

test.beforeEach(async () => {
  await db.migrate.latest()

  agent = supertest.agent(app)

  await agent.post("/register").type("form").send({
    email: "email",
    password: "password",
    name: "name",
    bio: "bio",
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
    .redirects(1)

  t.assert(response.text.includes("My tweet"))
})

test.serial("it renders a list of tweets", async (t) => {
  const response = await agent.get("/")

  t.assert(response.text.includes("<h3>Tweets</h3>"))
})

test.serial("create new tweet", async (t) => {
  await db("tweets").insert({
    content: "My tweet",
  })

  const response = await agent.get("/")

  t.assert(response.text.includes("My tweet"))
})

test.serial("tweet detail", async (t) => {
  const [tweet] = await db("tweets")
    .insert({
      content: "My tweet",
    })
    .returning("*")

  const response = await agent.get(`/tweet/${tweet.id}`)

  t.assert(response.text.includes("My tweet"))
})

test.serial("update tweet via form", async (t) => {
  await agent
    .post("/add-tweet")
    .type("form")
    .send({ content: "My tweet" })

  const response = await agent
    .post(`/update-tweet/1`)
    .type("form")
    .send({ content: "Your tweet" })
    .redirects(1)

  t.assert(response.text.includes("Your tweet"))
})

test.serial("remove tweet", async (t) => {
  await agent
    .post("/add-tweet")
    .type("form")
    .send({ content: "My tweet" })

  const response = await agent
    .get(`/remove-tweet/1`)
    .redirects(1)

  t.assert(!response.text.includes("My tweet"))
})

test.serial("like a tweet", async (t) => {
  const [tweet] = await db("tweets")
    .insert({
      content: "A tweet to like",
      user_id: 1,
    })
    .returning("*")

  const response = await agent
    .post(`/like-tweet/${tweet.id}`)
    .send()

  t.assert(response.status === 302)

  const likes = await db("likes").where({
    user_id: 1,
    likeable_id: tweet.id,
    likeable_type: "tweets",
  })
  t.assert(likes.length === 1)
})

test.serial("unlike a tweet", async (t) => {
  const [tweet] = await db("tweets")
    .insert({
      content: "A tweet to unlike",
      user_id: 1,
    })
    .returning("*")

  await db("likes").insert({
    user_id: 1,
    likeable_id: tweet.id,
    likeable_type: "tweets",
  })

  const response = await agent
    .post(`/unlike-tweet/${tweet.id}`)
    .send()

  t.assert(response.status === 302)

  const likes = await db("likes").where({
    user_id: 1,
    likeable_id: tweet.id,
    likeable_type: "tweets",
  })
  t.assert(likes.length === 0)
})

test.serial("tweet detail shows like status", async (t) => {
  const [tweet] = await db("tweets")
    .insert({
      content: "Tweet to check like status",
      user_id: 1,
    })
    .returning("*")

  await db("likes").insert({
    user_id: 1,
    likeable_id: tweet.id,
    likeable_type: "tweets",
  })

  const response = await agent.get(`/tweet/${tweet.id}`)

  t.assert(response.text.includes("unlike"))
})

// TODO: comment tweet

// TODO: retweet tweet

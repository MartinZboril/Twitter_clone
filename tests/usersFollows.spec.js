import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import db from "../src/db.js"
import User from "../src/models/user.js"
import Follow from "../src/models/follow.js"

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

  const { salt, hash, token } = await User.hashPassword(
    "anotherPassword",
  )

  await User.query().insert({
    email: "user2@example.com",
    name: "User Two",
    bio: "Bio Two",
    salt,
    hash,
    token,
  })
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial("Follow a user successfully", async (t) => {
  const followee = await User.query().findOne({
    email: "user2@example.com",
  })

  const response = await agent.post(
    `/follow/${followee.id}`,
  )
  t.is(response.status, 302)

  const follow = await Follow.query().findOne({
    followee_id: followee.id,
  })
  t.truthy(follow)
})

test.serial("Unfollow a user successfully", async (t) => {
  const followee = await User.query().findOne({
    email: "user2@example.com",
  })

  await Follow.query().insert({
    follower_id: signedUserId,
    followee_id: followee.id,
  })

  const response = await agent.post(
    `/unfollow/${followee.id}`,
  )
  t.is(response.status, 302)

  const followExists = await Follow.query()
    .where({
      follower_id: signedUserId,
      followee_id: followee.id,
    })
    .first()

  t.falsy(followExists)
})

test.serial(
  "Attempting to follow a user already followed should fail",
  async (t) => {
    const followee = await User.query().findOne({
      email: "user2@example.com",
    })

    await Follow.query().insert({
      follower_id: signedUserId,
      followee_id: followee.id,
    })

    const response = await agent.post(
      `/follow/${followee.id}`,
    )
    t.is(response.status, 400)
  },
)

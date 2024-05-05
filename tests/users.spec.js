import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import db from "../src/db.js"
import User from "../src/models/user.js"

test.beforeEach(async () => {
  await db.migrate.latest()
})

test.afterEach(async () => {
  await db.migrate.rollback()
})

test.serial("create new user", async (t) => {
  const { salt, hash, token } =
    await User.hashPassword("password")
  const user = await User.query().insert({
    email: "email@example.com",
    hash,
    salt,
    name: "name",
    bio: "bio",
    token,
  })

  t.is(user.name, "name")
  t.is(user.email, "email@example.com")
  t.is(user.bio, "bio")
  t.not(user.password, "password")
  t.truthy(user.token)
})

test.serial("get user by email and password", async (t) => {
  const { salt, hash, token } =
    await User.hashPassword("password")
  await User.query().insert({
    email: "email@example.com",
    hash,
    salt,
    name: "name",
    bio: "bio",
    token,
  })

  const fetchedUser = await User.query()
    .where("email", "email@example.com")
    .first()
  const isPasswordCorrect = await User.verifyPassword(
    "password",
    fetchedUser.salt,
    fetchedUser.hash,
  )

  t.truthy(fetchedUser)
  t.true(isPasswordCorrect)
  t.is(fetchedUser.email, "email@example.com")

  const isWrongPassword = await User.verifyPassword(
    "wrongpassword",
    fetchedUser.salt,
    fetchedUser.hash,
  )
  t.false(isWrongPassword)
})

test.serial(
  "POST /register will create new user",
  async (t) => {
    const response = await supertest(app)
      .post("/register")
      .type("form")
      .send({
        email: "email@example.com",
        password: "password",
        name: "name",
        bio: "bio",
      })
      .expect(302)

    const user = await User.query()
      .where("email", "email@example.com")
      .first()
    t.not(user, null)
    t.is(user.email, "email@example.com")
  },
)

test.serial(
  "POST /login will sign in the user",
  async (t) => {
    const { salt, hash, token } =
      await User.hashPassword("password")
    await User.query().insert({
      email: "email@example.com",
      hash,
      salt,
      name: "name",
      bio: "bio",
      token,
    })

    const response = await supertest(app)
      .post("/login")
      .type("form")
      .send({
        email: "email@example.com",
        password: "password",
      })
      .expect(302)

    t.truthy(response.headers["set-cookie"])
  },
)

// TODO: password recovery

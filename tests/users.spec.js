import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import db from "../src/db.js"
import { createUser, getUser } from "../src/db/users.js"

test.beforeEach(async () => {
    await db.migrate.latest()
})

test.afterEach(async () => {
    await db.migrate.rollback()
})

// Unit tests

test.serial("create new user", async (t) => {
    const user = await createUser("email", "password", "name", "bio")

    t.is(user.name, "name")
    t.is(user.email, "email")
    t.is(user.bio, "bio")
    t.not(user.hash, "password")
})

test.serial("get user by email and password", async (t) => {
    const user = await createUser("email", "password","name", "bio")

    t.deepEqual(await getUser("email", "password"), user)
    t.is(await getUser("email", "bad password"), null)
    t.is(await getUser("bad email", "password"), null)
})

// Super tests

test.serial("GET /register shows registration from", async (t) => {
    const response = await supertest(app).get("/register")

    t.assert(response.text.includes("Register"))
})

test.serial("POST /register will create new user", async (t) => {
    await supertest(app).post("/register").type("form").send({ email: "email", password: "password", name: "name", bio: "bio" })

    t.not(await getUser("email", "password"), null)
})

test.serial("after registration and redirect user name is visible", async (t) => {
    const agent = supertest.agent(app)

    const response = await agent.post("/register").type("form").send({ email: "email", password: "password", name: "name", bio: "bio" }).redirects(1)

    t.assert(response.text.includes("name"))
})

test.serial("GET /login shows login from", async (t) => {
    const response = await supertest(app).get("/login")

    t.assert(response.text.includes("Login"))
})

test.serial("POST /login will signup the user", async (t) => {
    const user = await createUser("email", "password", "name", "bio")

    const response = await supertest(app)
        .post("/login")
        .type("form")
        .send({ email: "email", password: "password" })

    const cookies = response.headers['set-cookie']
    const tokenCookie = cookies.find(cookie => cookie.startsWith("token="))
    const tokenValue = tokenCookie.split(';')[0].split('=')[1]

    t.deepEqual(tokenValue, user.token)
})

test.serial("after login and redirect user name is visible", async (t) => {
    const user = await createUser("email", "password", "name", "bio")
    const agent = supertest.agent(app)

    const response = await agent.post("/login").type("form").send({ email: "email", password: "password" }).redirects(1)

    t.assert(response.text.includes(user.name))
})

// TODO: password recovery
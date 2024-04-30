import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import db from "../src/db.js"
import { createUser, getUser } from "../src/db/users.js";

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
    t.notDeepEqual(await getUser("email", "bad password"), user)
    t.notDeepEqual(await getUser("bad email", "password"), user)
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

test.serial("POST /logout will remove the user token", async (t) => {
    const user = await createUser("email", "password", "name", "bio")

    const responseLogin = await supertest(app)
        .post("/login")
        .type("form")
        .send({ email: "email", password: "password" })

    const cookies = responseLogin.headers['set-cookie']
    const tokenCookie = cookies.find(cookie => cookie.startsWith("token="))
    const tokenValue = tokenCookie.split(';')[0].split('=')[1]

    t.deepEqual(tokenValue, user.token)

    const responseLogout = await supertest(app)
        .post("/logout")
        .type("form")

    const cookiesAfterLogout = responseLogout.headers['set-cookie']
    const tokenCookieAfterLogout = cookiesAfterLogout && cookiesAfterLogout.find(cookie => cookie.startsWith("token="))

    t.falsy(tokenCookieAfterLogout)
})

// TODO: mock signed user
test.serial("GET /edit profile shows form for update user profile", async (t) => {
    const response = await supertest(app).get("/edit-profile")

    t.assert(response.text.includes("Edit profile"))
})

// TODO: mock signed user
test.serial("POST /edit profile will update user", async (t) => {
    const user = await createUser("email", "password", "name", "bio")

    await supertest(app).post("/edit-profile").type("form").send({ email: "email", name: "updated name", bio: "bio" })

    const updatedUser = await getUser("email", "password")

    t.deepEqual(updatedUser.name, "updated name")
})

// TODO: mock signed user
test.serial("after profile editing and redirect user name is updated", async (t) => {
    const user = await createUser("email", "password", "name", "bio")
    const agent = supertest.agent(app)

    const response = await agent.post("/edit-profile").type("form").send({ email: "email", name: "updated name", bio: "bio" }).redirects(1)

    t.assert(response.text.includes("updated name"))
})

// TODO: mock signed user
test.serial("GET /change password shows form for update user password", async (t) => {
    const response = await supertest(app).get("/change-password")

    t.assert(response.text.includes("Change password"))
})

// TODO: mock signed user
test.serial("POST /change password will update user password", async (t) => {
    // TODO: make test
})

// TODO: mock signed user
test.serial("after password change user can signed with new password", async (t) => {
    // TODO: make test
})

// TODO: password recovery

// TODO: check auth middlewares
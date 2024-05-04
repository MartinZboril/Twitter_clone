import test from "ava"
import supertest from "supertest"
import { app } from "../src/app.js"
import db from "../src/db.js"
import { getUser } from "../src/db/users.js"

let agent

test.beforeEach(async () => {
    await db.migrate.latest()

    agent = supertest.agent(app)

    await agent
        .post("/register")
        .type("form")
        .send({ email: "email", password: "password", name: "name", bio: "bio" })
})

test.afterEach(async () => {
    await db.migrate.rollback()
})

test.serial("POST /logout will remove the user token", async (t) => {
    const responseLogout = await agent
        .post("/logout")
        .type("form")

    const cookiesAfterLogout = responseLogout.headers['set-cookie']
    const tokenCookieAfterLogout = cookiesAfterLogout && cookiesAfterLogout.find(cookie => cookie.startsWith("token="))

    t.falsy(tokenCookieAfterLogout)
})

test.serial("GET /edit profile shows form for update user profile", async (t) => {
    const response = await agent.get("/edit-profile")

    t.assert(response.text.includes("Edit profile"))
})

test.serial("POST /edit profile will update user", async (t) => {
    await agent.post("/edit-profile").type("form").send({ email: "email", name: "updated name", bio: "bio" })

    const updatedUser = await getUser("email", "password")

    t.deepEqual(updatedUser.name, "updated name")
})

test.serial("after profile editing and redirect user name is updated", async (t) => {
    const response = await agent.post("/edit-profile").type("form").send({ email: "email", name: "updated name", bio: "bio" }).redirects(1)

    t.assert(response.text.includes("updated name"))
})

test.serial("GET /change password shows form for update user password", async (t) => {
    const response = await agent.get("/change-password")

    t.assert(response.text.includes("Change password"))
})

test.serial("POST /change password will update user password and user can signed with it", async (t) => {
    const response = await agent.post("/change-password").type("form").send({ current_password: "password", new_password: "new password", password_confirmation: "new password" }).redirects(1)

    await agent
        .post("/logout")
        .type("form")

    const responseLogin = await supertest(app)
        .post("/login")
        .type("form")
        .send({ email: "email", password: "password" })

    const cookies = responseLogin.headers['set-cookie']
    const tokenCookie = cookies.find(cookie => cookie.startsWith("token="))
    const tokenValue = tokenCookie.split(';')[0].split('=')[1]

    t.truthy(tokenValue)
})
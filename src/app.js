import db from "./db.js"
import express from "express"
import cookieParser from "cookie-parser"
import expressLayouts from "express-ejs-layouts"
import { usersRouter } from "./routes/users.js"
import { loadUser } from "./middlewares/loadUser.js"
import { tweetsRouter } from "./routes/tweets.js"
import * as home from "./controllers/home.js"
import Users from "./controllers/users.js"
import Home from "./controllers/home.js"

export const app = express()

app.use(expressLayouts)
app.set("layout", "./layouts/default")
app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(loadUser)

const homeController = new Home()
app.get("/", homeController.index.bind(homeController))

app.use(usersRouter)
app.use(tweetsRouter)

// TODO: modify dealing with server errors

app.use((req, res) => {
  res.status(404)
  res.send("404 - PAGE NOT FOUND")
})

app.use((err, req, res) => {
  console.error(err)
  res.status(500)
  res.send("500 - SERVER SIDE ERROR")
})

import db from "./db.js"
import session from "express-session"
import flash from "connect-flash"
import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import expressLayouts from "express-ejs-layouts"
import { usersRouter } from "./routes/users.js"
import { loadUser } from "./middlewares/loadUser.js"
import { tweetsRouter } from "./routes/tweets.js"
import Home from "./controllers/home.js"
import { handleErrorMessages } from "./middlewares/handleErrorMessages.js"
import { handleFlashMessages } from "./middlewares/handleFlashMessages.js"

dotenv.config()

export const app = express()

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
)

app.use(flash())

app.use(expressLayouts)
app.set("layout", "./layouts/default")
app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(loadUser)

const homeController = new Home()
app.get(
  "/",
  handleErrorMessages,
  handleFlashMessages,
  homeController.index.bind(homeController),
)

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

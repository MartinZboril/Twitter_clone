import express from "express"
import { db, createUser, getUserByToken } from "./db.js"
import cookieParser from 'cookie-parser'

export const app = express()

app.set("view engine", "ejs")

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const authorized = (req, res, next) => {
    if (res.locals.user) {
        next()
    } else {
        res.redirect('/register')
    }
}

const guest = (req, res, next) => {
    if (! res.locals.user) {
        next()
    } else {
        res.redirect('/')
    }
}

app.use(async (req, res, next) => {
    const token = req.cookies.token

    if (token) {
        res.locals.user = await getUserByToken(token)
    } else {
        res.locals.user = null
    }

    next()
})

app.use((req, res, next) => {
    console.log("Incomming request", req.method, req.url)
    next()
})

app.get("/", async (req, res) => {
    res.render("index")
})

app.get("/register", guest, async (req, res) => {
    res.render("users/register")
})

app.post("/register", guest, async (req, res) => {
    const name = req.body.name
    const bio = req.body.bio
    const password = req.body.password

    const user = await createUser(name, bio, password)

    res.cookie("token", user.token)

    res.redirect("/account")
})

app.get("/account", authorized, async (req, res) => {
    res.render("users/account")
})

app.use((req, res) => {
    res.status(404)
    res.send("404 - Stránka nenalezena")
})

app.use((err, req, res, next) => {
    console.error(err)
    res.status(500)
    res.send("500 - Chyba na straně serveru")
})

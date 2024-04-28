import express from "express"
import {db, createUser, getUserByToken, getUser} from "./db.js"
import cookieParser from "cookie-parser"
import expressLayouts from "express-ejs-layouts"
export const app = express()

app.use(expressLayouts)
app.set("layout", "./layouts/default")
app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const authorized = (req, res, next) => {
    if (res.locals.user) {
        next()
    } else {
        res.redirect("/register")
    }
}

const guest = (req, res, next) => {
    if (! res.locals.user) {
        next()
    } else {
        res.redirect("/")
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
    // TODO: change layout if user is not authorized to guest layout
    res.render("index", { title: "Home" })
})

app.get("/register", guest, async (req, res) => {
    res.render("users/register", { title: "Register" })
})

app.post("/register", guest, async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const name = req.body.name
    const bio = req.body.bio


    const user = await createUser(email, password, name, bio)

    res.cookie("token", user.token)

    res.redirect("/account")
})

app.get("/login", guest, async (req, res) => {
    res.render("users/login", { title: "Login" })
})

app.post('/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const user = await getUser(email, password)

    if (user) {
        res.cookie('token', user.token)

        res.redirect('/account')
    } else {
        res.render('login', {
            error: 'The given credentials does not match with our records!',
        })
    }
})

app.get('/logout', (req, res) => {
    res.cookie('token', undefined)

    res.redirect('back')
})

app.get("/account", authorized, async (req, res) => {
    res.render("users/account", { title: 'Account' })
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

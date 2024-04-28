import express from "express"
import cookieParser from "cookie-parser"
import expressLayouts from "express-ejs-layouts"
import usersRouter from "./routes/users.js"
import loadUser from "./middlewares/loadUser.js"

export const app = express()

app.use(expressLayouts)
app.set("layout", "./layouts/default")
app.set("view engine", "ejs")

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(loadUser)

app.get("/", async (req, res) => {
    // TODO: change layout if user is not authorized to guest layout
    res.render("index", { title: "Home" })
})

app.use(usersRouter)

// TODO: modify dealing with server errors

app.use((req, res) => {
    res.status(404)
    res.send("404 - Stránka nenalezena")
})

app.use((err, req, res) => {
    console.error(err)
    res.status(500)
    res.send("500 - Chyba na straně serveru")
})

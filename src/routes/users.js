import express from 'express'
import { createUser, getUser } from '../db/users.js'
import guest from "../middlewares/guest.js";
import authorized from "../middlewares/authorized.js";

const router = express.Router()

router.get("/register", guest, async (req, res) => {
    res.render("users/register", { title: "Register" })
})

router.post("/register", guest, async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const name = req.body.name
    const bio = req.body.bio


    const user = await createUser(email, password, name, bio)

    res.cookie("token", user.token)

    res.redirect("/account")
})

router.get("/login", guest, async (req, res) => {
    res.render("users/login", { title: "Login" })
})

router.post('/login', async (req, res) => {
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

router.get('/logout', (req, res) => {
    res.cookie('token', undefined)

    res.redirect('back')
})

router.get("/account", authorized, async (req, res) => {
    res.render("users/account", { title: 'Account' })
})

export default router
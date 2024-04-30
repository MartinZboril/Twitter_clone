import express from 'express'
import {changeUserPassword, createUser, getUser, updateUser} from '../db/users.js'
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

    res.redirect("/profile")
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

        res.redirect('/profile')
    } else {
        res.render('users/login', {
            title: "Login",
            error: 'The given credentials does not match with our records!',
        })
    }
})

router.get('/logout', (req, res) => {
    res.cookie('token', undefined)

    res.redirect('back')
})

router.get("/profile", authorized, async (req, res) => {
    res.render("users/profile", { title: 'Profile' })
})

router.get("/edit-profile", authorized, async (req, res) => {
    res.render("users/edit-profile", { title: 'Edit profile' })
})

router.post("/edit-profile", authorized, async (req, res) => {
    const id = res.locals.user.id
    const email = req.body.email
    const name = req.body.name
    const bio = req.body.bio

    const user = await updateUser(id, email, name, bio)

    res.redirect("/edit-profile")
})

router.get("/change-password", authorized, async (req, res) => {
    res.render("users/change-password", { title: 'Change password' })
})

router.post("/change-password", authorized, async (req, res) => {
    const id = res.locals.user.id
    const currentPassword = req.body.current_password
    const newPassword = req.body.new_password
    const passwordConfirmation = req.body.password_confirmation

    const user = await changeUserPassword(id, currentPassword, newPassword, passwordConfirmation)

    res.cookie('token', user.token)

    res.redirect("/change-password")
})

export default router
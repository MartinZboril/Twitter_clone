import { Router } from "express"
import Users from "../controllers/users.js"
import { guest } from "../middlewares/guest.js"
import { authorized } from "../middlewares/authorized.js"

export const usersRouter = new Router()
const userController = new Users()

usersRouter.get("/register", guest, (req, res) =>
  res.render("users/register", { title: "Register" }),
)
usersRouter.post(
  "/register",
  guest,
  userController.register.bind(userController),
)

usersRouter.get("/login", guest, (req, res) =>
  res.render("users/login", { title: "Login" }),
)
usersRouter.post(
  "/login",
  userController.login.bind(userController),
)

usersRouter.get(
  "/logout",
  authorized,
  userController.logout.bind(userController),
)

usersRouter.get(
  "/profile/:id",
  authorized,
  userController.showProfile.bind(userController),
)

usersRouter.get("/edit-profile", authorized, (req, res) =>
  res.render("users/edit-profile", {
    title: "Edit profile",
  }),
)
usersRouter.post(
  "/edit-profile",
  authorized,
  userController.updateProfile.bind(userController),
)

usersRouter.get(
  "/change-password",
  authorized,
  (req, res) =>
    res.render("users/change-password", {
      title: "Change password",
    }),
)
usersRouter.post(
  "/change-password",
  authorized,
  userController.changePassword.bind(userController),
)

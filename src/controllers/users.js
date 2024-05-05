import User from "../models/User.js"

export default class Users {
  async register(req, res) {
    const { email, password, name, bio } = req.body
    const { salt, hash, token } =
      await User.hashPassword(password)
    const user = await User.query().insert({
      email,
      salt,
      hash,
      name,
      bio,
      token,
    })
    res.cookie("token", user.token)
    res.redirect("/profile")
  }

  async login(req, res) {
    const { email, password } = req.body

    const user = await User.query().findOne({ email })

    if (
      !user ||
      !(await User.verifyPassword(
        password,
        user.salt,
        user.hash,
      ))
    ) {
      res.render("users/login", {
        title: "Login",
        error: "Invalid credentials.",
      })
      return
    }
    res.cookie("token", user.token)
    res.redirect("/profile")
  }

  async logout(req, res) {
    res.cookie("token", "", { expires: new Date(0) })
    res.redirect("/")
  }

  async updateProfile(req, res) {
    const { email, name, bio } = req.body

    const user = await User.query().patchAndFetchById(
      res.locals.user.id,
      {
        email,
        name,
        bio,
      },
    )
    res.redirect("/profile")
  }

  async changePassword(req, res) {
    const currentPassword = req.body.current_password
    const newPassword = req.body.new_password
    const passwordConfirmation =
      req.body.password_confirmation

    const user = await User.query().findById(
      res.locals.user.id,
    )
    if (
      user &&
      (await User.verifyPassword(
        currentPassword,
        user.salt,
        user.hash,
      )) &&
      newPassword === passwordConfirmation
    ) {
      await User.updatePassword(newPassword)
      res.cookie("token", user.token)
      res.redirect("/profile")
    } else {
      res.render("users/change-password", {
        title: "Change password",
        error: "Current password is incorrect.",
      })
    }
  }
}

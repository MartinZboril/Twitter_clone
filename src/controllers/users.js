import User from "../models/User.js"
import Follow from "../models/follow.js"

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
    res.redirect("/")
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
    res.redirect("/")
  }

  async logout(req, res) {
    res.cookie("token", "", { expires: new Date(0) })
    res.redirect("/")
  }

  async showProfile(req, res, next) {
    const currentUser = res.locals.user
    const displayedUser = await User.query()
      .findById(req.params.id)
      .withGraphFetched(
        "[followers, followees, tweets, likes]",
      )

    if (!displayedUser) return next()

    const isFollowing = await Follow.query().findOne({
      follower_id: currentUser.id,
      followee_id: displayedUser.id,
    })

    res.render("users/profile", {
      title: "Profile",
      displayedUser,
      isFollowing: !!isFollowing,
      followers: displayedUser.followers,
      followees: displayedUser.followees,
    })
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
    res.redirect(`/profile/${user.id}`)
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
      res.redirect(`/profile/${user.id}`)
    } else {
      res.render("users/change-password", {
        title: "Change password",
        error: "Current password is incorrect.",
      })
    }
  }

  async followUser(req, res) {
    const followeeId = parseInt(req.params.id)
    const followerId = res.locals.user.id

    const existingFollow = await Follow.query().findOne({
      follower_id: followerId,
      followee_id: followeeId,
    })
    if (!existingFollow) {
      await Follow.query().insert({
        follower_id: followerId,
        followee_id: followeeId,
      })
      res.redirect(`/profile/${followeeId}`)
    } else {
      res.status(400).send("Already following")
    }
  }

  async unfollowUser(req, res) {
    const followeeId = parseInt(req.params.id)
    const followerId = res.locals.user.id

    await Follow.query().delete().where({
      follower_id: followerId,
      followee_id: followeeId,
    })
    res.redirect(`/profile/${followeeId}`)
  }
}

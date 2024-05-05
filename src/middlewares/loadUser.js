import User from "../models/user.js"

export const loadUser = async (req, res, next) => {
  const token = req.cookies.token

  if (token) {
    try {
      res.locals.user = await User.findByToken(token)
    } catch (error) {
      console.error("Error fetching user by token:", error)
      res.locals.user = null
    }
  } else {
    res.locals.user = null
  }

  next()
}

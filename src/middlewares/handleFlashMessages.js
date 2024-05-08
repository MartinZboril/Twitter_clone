export const handleFlashMessages = async (
  req,
  res,
  next,
) => {
  res.locals.messages = req.flash("messages")
  next()
}

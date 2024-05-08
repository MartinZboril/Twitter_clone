export const handleErrorMessages = async (
  req,
  res,
  next,
) => {
  res.locals.errors = req.flash("errors")[0] || {}
  res.locals.data = req.flash("data")[0] || {}
  next()
}

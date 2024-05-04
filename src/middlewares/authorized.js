export const authorized = async (req, res, next) => {
    if (res.locals.user) {
        next()
    } else {
        res.redirect("/")
    }
}
import Tweet from "../models/tweet.js"

export default class Home {
  async index(req, res, next) {
    const tweets = await Tweet.query().withGraphFetched(
      "[author, likes]",
    )

    // TODO: change layout if user is not authorized to guest layout
    res.render("index", {
      title: "Home",
      tweets,
    })
  }
}

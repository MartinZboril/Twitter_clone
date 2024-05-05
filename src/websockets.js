import { WebSocketServer } from "ws"
import ejs from "ejs"
import Tweet from "./models/tweet.js"
import User from "./models/user.js"

const connections = new Set()

export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on("connection", (socket) => {
    connections.add(socket)

    console.log("New connection", connections.size)

    socket.on("close", () => {
      connections.delete(socket)

      console.log("Closed connection", connections.size)
    })
  })
}

export const sendTweetListToAllConnections = async (
  userId,
) => {
  const tweets = await Tweet.query().withGraphFetched(
    "[author, likes, retweets]",
  )

  const user = await User.query().findById(userId)

  const tweetList = await ejs.renderFile(
    "views/tweets/partials/_tweets.ejs",
    { tweets, user },
  )

  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: "tweetList",
        html: tweetList,
      }),
    )
  }
}

export const sendTweetDetailToAllConnections = async (
  id,
  userId,
) => {
  const tweet = await Tweet.query()
    .findById(id)
    .withGraphFetched("[author, likes, comments.author, retweets]")

  if (!tweet) return

  const user = await User.query().findById(userId)

  const tweetDetail = await ejs.renderFile(
    "views/tweets/partials/_tweet.ejs",
    { tweet, user },
  )

  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: "tweetDetail",
        id: tweet.id,
        html: tweetDetail,
      }),
    )
  }
}

export const sendTweetDeletedToAllConnections = async (
  id,
) => {
  for (const connection of connections) {
    connection.send(
      JSON.stringify({
        type: "tweetDeleted",
        id,
      }),
    )
  }
}

import { WebSocketServer } from "ws"
import ejs from "ejs"
import { getAllTweets, getTweetById } from "./db/tweets.js"

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

export const sendTweetListToAllConnections = async () => {
  const tweetList = await ejs.renderFile(
    "views/tweets/partials/_tweets.ejs",
    {
      tweets: await getAllTweets(),
    },
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
) => {
  const tweet = await getTweetById(id)

  const tweetDetail = await ejs.renderFile(
    "views/tweets/partials/_tweet.ejs",
    {
      tweet,
    },
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

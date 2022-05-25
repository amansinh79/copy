import DHT from "@hyperswarm/dht"
import { send } from "@solvencino/fs-stream"
import debug from "debug"

export default async function (path) {
  const node = new DHT()
  const server = node.createServer()

  server.on("connection", async function (noiseSocket) {
    const s = await send(path)
    s.pipe(noiseSocket)
    s.on("end", () => {
      node.destroy()
    })
  })

  const keyPair = DHT.keyPair()

  console.log("Key :", keyPair.publicKey.toString("hex"))

  await server.listen(keyPair)
}

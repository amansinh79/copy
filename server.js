import DHT from "@hyperswarm/dht"
import { send } from "@solvencino/fs-stream"

export default async function (path, files) {
  const node = new DHT()
  const server = node.createServer()

  server.on("connection", async function (noiseSocket) {
    const s = await send(path, files, (file) => {
      console.log(file)
      return true
    })
    s.pipe(noiseSocket)
    s.on("end", () => {
      node.destroy()
    })
  })

  const keyPair = DHT.keyPair()

  console.log("Key :", keyPair.publicKey.toString("hex"))

  await server.listen(keyPair)
}

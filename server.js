import DHT from "@hyperswarm/dht"
import { send } from "@solvencino/fs-stream"
import { deserialize, serialize } from "v8"

export default async function (path) {
  const node = new DHT()
  const server = node.createServer()
  let check

  server.on("connection", async function (noiseSocket) {
    noiseSocket.on("data", (chunk) => {
      const data = deserialize(chunk)
      check(data.result)
    })

    const s = await send(path, (file) => {
      noiseSocket.write(serialize({ type: "CHECK", file }))
      return new Promise((res) => {
        check = res
      })
    })

    s.on("data", (chunk) => {
      noiseSocket.write(serialize({ type: "DEFAULT", chunk: chunk.toString() }))
    })
    s.on("end", () => {
      server.close()
    })
  })

  server.on("close", () => {
    process.exit()
  })

  const keyPair = DHT.keyPair()

  console.log("Key :", keyPair.publicKey.toString("hex"))

  await server.listen(keyPair)
}

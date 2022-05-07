import DHT from "@hyperswarm/dht"
import { writeFileSync } from "fs"
import { send } from "@solvencino/fs-stream"
import { deserialize, serialize } from "v8"

const node = new DHT()
const server = node.createServer()
const files = {}

server.on("connection", async function (noiseSocket) {
  noiseSocket.on("data", (chunk) => {
    const data = deserialize(chunk)
    if (data.result) {
      console.log(data.file)
    }
    files[data.file](data.result)
    delete files[data.file]
  })

  const s = await send("files", async (file) => {
    noiseSocket.write(serialize({ type: "CHECK", file }))
    return new Promise((res) => {
      files[file] = res
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

writeFileSync("./keys.json", JSON.stringify(keyPair))

await server.listen(keyPair)

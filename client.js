import DHT from "@hyperswarm/dht"
import { existsSync, readFileSync } from "fs"
import { receive } from "@solvencino/fs-stream"
import { join } from "path"
import { deserialize, serialize } from "v8"

const keys = JSON.parse(readFileSync("./keys.json"))

const node = new DHT()
const noiseSocket = node.connect(Buffer.from(keys.publicKey))

const path = "copied"
const r = receive(path)

noiseSocket.on("data", (chunk) => {
  const data = deserialize(chunk)
  if (data.type === "DEFAULT") {
    r.write(data.chunk)
  } else {
    const { file } = data
    noiseSocket.write(serialize({ type: "CHECK", file, result: !existsSync(join(path, file)) }))
  }
})

noiseSocket.on("end", () => {
  process.exit()
})

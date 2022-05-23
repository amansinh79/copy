import DHT from "@hyperswarm/dht"
import { existsSync } from "fs"
import { receive } from "@solvencino/fs-stream"
import { join } from "path"
import { deserialize, serialize } from "v8"

export default function (path, key) {
  const node = new DHT()
  const noiseSocket = node.connect(Buffer.from(key, "hex"))

  const r = receive(path)

  noiseSocket.on("data", (chunk) => {
    const data = deserialize(chunk)
    if (data.type === "DEFAULT") {
      r.write(data.chunk)
    } else {
      noiseSocket.write(serialize({ type: "CHECK", result: !existsSync(join(path, data.file)) }))
    }
  })

  noiseSocket.on("end", () => {
    process.exit()
  })
}

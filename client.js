import DHT from "@hyperswarm/dht"
import { receive } from "@solvencino/fs-stream"

export default function (path, key) {
  const node = new DHT()
  const noiseSocket = node.connect(Buffer.from(key, "hex"))

  const r = receive(path)

  noiseSocket.pipe(r)

  noiseSocket.on("end", () => {
    node.destroy()
  })
}

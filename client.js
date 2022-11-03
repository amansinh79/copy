import DHT from "@hyperswarm/dht"
import pump from "pump"
import bind from "bind-easy"
import axios from "axios"
import ProgressBar from "progress"
import fs from "fs"
import p from "path"

export default async function (path, key) {
  path = p.resolve(path)

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true })
  }

  const node = new DHT()
  const port = 8081
  const url = "http://localhost:" + port
  key = Buffer.from(key, "hex")

  const server = await bind.tcp(port)
  server.on("connection", (socket) => {
    pump(socket, node.connect(key), socket)
  })

  const client = axios.create({
    baseURL: url,
  })

  const { data: hashes } = await client({
    method: "GET",
    url: "/",
  })

  for (const hash of hashes) {
    const { data, headers } = await client({
      method: "GET",
      url: "/" + hash,
      responseType: "stream",
    })
    await download(data, headers, path)
    console.log()
  }

  console.log("All files copied, closing!")

  server.close()
  node.destroy()
}

function download(data, headers, path) {
  const filename = headers["content-disposition"].split("filename=")[1].split(";")[0].replaceAll('"', "")
  const totalLength = headers["content-length"]

  console.log("Downloading " + filename)
  const progressBar = new ProgressBar("-> downloading [:bar] :percent :etas", {
    width: 40,
    complete: "=",
    incomplete: " ",
    renderThrottle: 1,
    total: parseInt(totalLength),
  })
  const wstream = fs.createWriteStream(p.join(path, filename))

  data.on("data", (chunk) => progressBar.tick(chunk.length))
  data.pipe(wstream)

  return new Promise((res, rej) => {
    data.on("end", res)
  })
}

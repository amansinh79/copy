#!/usr/bin/env node
import client from "./client.js"
import server from "./server.js"
import { resolve, sep } from "path"
import { selectFiles } from "select-files-cli"

const args = process.argv.slice(2)
let path = args[0]
const key = args[1]

if (key) {
  path = resolve(path)
  client(path, key)
} else {
  let files
  if (path) {
    files = [resolve(path)]
  } else {
    path = process.cwd()
    const { selectedFiles, status } = await selectFiles({ clearConsole: false })
    if (status === "SELECTION_COMPLETED") {
      files = selectedFiles
    } else {
      console.log(status)
      process.exit()
    }
  }
  server(files)
}

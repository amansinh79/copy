#!/usr/bin/env node
import client from "./client.js"
import server from "./server.js"
import { resolve, sep } from "path"
import fs from "fs"
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
    path = resolve(path)
    files = getFiles(path)
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
  server(path, files)
}

function getFiles(dir) {
  return fs.readdirSync(dir).flatMap((item) => {
    const p = `${dir}${sep}${item}`
    if (fs.statSync(p).isDirectory()) {
      return getFiles(p)
    }
    return p
  })
}

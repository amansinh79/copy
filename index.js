#!/usr/bin/env node
import client from "./client.js"
import server from "./server.js"
import { resolve } from "path"

const args = process.argv.slice(2)
const path = resolve(args[0])
const key = args[1]

if (key) {
  client(path, key)
} else {
  server(path)
}

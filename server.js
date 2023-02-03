import DHT from "@hyperswarm/dht";
import readyFiles from "./utils.js";
import md5 from "md5";
import express from "express";
import { basename } from "path";
import pump from "pump";
import net from "net";

const data = {};

export default async function (files) {
  const port = 8080;
  readyFiles(files).forEach((t) => {
    data[md5(t)] = t;
  });

  console.log(data);
  console.log("File Selected :");
  console.log(
    Object.values(data)
      .map((t) => basename(t))
      .join("\n")
  );
  console.log();

  readyServer(port);

  const node = new DHT();
  const server = node.createServer();

  server.on("connection", async function (noiseSocket) {
    pump(noiseSocket, net.connect(port, "localhost"), noiseSocket);
  });

  const keyPair = DHT.keyPair();

  console.log("Key :", keyPair.publicKey.toString("hex"));

  await server.listen(keyPair);
}

function readyServer(port) {
  const app = express();
  app.get("/", (req, res) => {
    res.json(Object.keys(data));
  });

  app.get("/:hash", (req, res) => {
    const { hash } = req.params;
    res.download(data[hash]);
  });

  app.listen(port, () => {
    console.log("Express server Listening on " + port);
  });
}

import express from "express";

import http from "http";

import { Server } from "socket.io";

import cors from "cors";

import dotenv from "dotenv";

import missionRoutes from "./routes/missionRoutes.js";

import setupSocket from "./sockets/socketHandler.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setupSocket(io);

app.use(
  "/mission",
  missionRoutes(io)
);

const PORT =
  process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(
    `Pulse Agent running on port ${PORT}`
  );
});
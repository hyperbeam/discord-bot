import { Client, Server } from "colyseus";
import cors from "cors";
import express, { Express } from "express";
import { createServer } from "http";
import morgan from "morgan";
import { authorize } from "./discord";
import { BotRoom } from "./room";

const app: Express = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(
	cors({
		origin: process.env.VITE_CLIENT_BASE_URL,
		methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Origin"],
		credentials: true,
	}),
);

app.get("/authorize/:code", async (req, res) => {
	if (!req.params.code) return res.status(400).send({ error: "No code provided" });
	const data = await authorize(req.params.code).catch((e) => {
		console.error(e);
		return res.status(500).send({ error: "Could not authorize user." });
	});
	if (data) return res.status(200).send(data);
});

const server = new Server({
	server: createServer(app),
});

server
	.define("room", BotRoom)
	.on("create", (room: BotRoom) => {
		console.log(`Room ${room.roomId} created.`);
	})
	.on("dispose", (room: BotRoom) => {
		console.log(`Room ${room.roomId} disposed.`);
	})
	.on("join", (room: BotRoom, client: Client) => {
		console.log(`Client ${client.sessionId} joined room ${room.roomId}`);
	})
	.on("leave", (room: BotRoom, client: Client) => {
		console.log(`Client ${client.sessionId} left room ${room.roomId}`);
	});

export default server;

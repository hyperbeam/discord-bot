import { Client, Server } from "colyseus";
import cors from "cors";
import express, { Express } from "express";
import { createServer } from "http";
import morgan from "morgan";
import { authorize } from "./discord";
import { BotRoom } from "./room";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { networkInterfaces } from "os";

const defaultAddresses = Object.values(networkInterfaces())
	.flatMap((nInterface) => nInterface ?? [])
	.filter(
		(detail) =>
			detail &&
			detail.address &&
			// Node < v18
			((typeof detail.family === "string" && detail.family === "IPv4") ||
				// Node >= v18
				(typeof detail.family === "number" && detail.family === 4)),
	)
	.map((detail) => detail.address);

if (!defaultAddresses.includes("localhost")) defaultAddresses.push("localhost");

const protocols = ["http", "https", "ws", "wss"];
const addresses: string[] = [];
defaultAddresses.forEach((address) => {
	protocols.forEach((protocol) => addresses.push(`${protocol}://${address}:${process.env.VITE_CLIENT_PORT}`));
});

const app: Express = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(
	cors({
		origin: addresses,
		methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Origin"],
		credentials: true,
	}),
);

app.get("/authorize/:code", async (req, res) => {
	if (!req.params.code) return res.status(400).send({ error: "No code provided" });
	try {
		const data = await authorize(req.params.code);
		if (data) return res.status(200).send(data);
	} catch (err) {
		return res.status(500).send({ error: "Could not authorize user." });
	}
});

const server = new Server({
	transport: new WebSocketTransport({
		server: createServer(app),
	}),
	gracefullyShutdown: false,
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

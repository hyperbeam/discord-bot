import { WebSocketTransport } from "@colyseus/ws-transport";
import { Server } from "colyseus";
import cors from "cors";
import express, { Express } from "express";
import { createServer } from "http";
import morgan from "morgan";
import { networkInterfaces } from "os";

import db from "./database";
import { authorize } from "./discord";
import { AuthenticatedClient, BotRoom } from "./room";

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

app.get("/info/:url", async (req, res) => {
	if (!req.params.url) return res.status(400).send({ error: "No url provided" });
	const room = await db.session.findUnique({
		where: { url: req.params.url },
		select: {
			createdAt: true,
			endedAt: true,
			owner: {
				select: {
					username: true,
					discriminator: true,
				},
			},
		},
	});
	if (!room) return res.status(404).send({ error: "Room not found" });
	if (room.endedAt) {
		const lastDay = Date.now() - 1000 * 60 * 60 * 24;
		if (room.endedAt.getTime() <= lastDay) {
			return res.status(404).send({ error: "Room not found" });
		}
	}
	return res.status(200).send({
		...room,
		active: !room.endedAt,
	});
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
		console.log(`Room ${room.roomId} created by user ${room.state.ownerId}.`);
	})
	.on("dispose", (room: BotRoom) => {
		console.log(`Room ${room.roomId} disposed.`);
	})
	.on("join", (room: BotRoom, client: AuthenticatedClient) => {
		console.log(`${client.userData.name} (${client.userData.id} - ${client.sessionId}) joined room ${room.roomId}`);
	})
	.on("leave", (room: BotRoom, client: AuthenticatedClient) => {
		console.log(`${client.userData.name} (${client.userData.id} - ${client.sessionId}) left room ${room.roomId}`);
	});

export default server;

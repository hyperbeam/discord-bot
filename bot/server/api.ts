import { PrismaClient } from "@prisma/client";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

export default function apiServer(db: PrismaClient) {
	const app = express();
	const httpServer = createServer(app);
	const io = new Server(httpServer, {
		serveClient: false,
		cors: {
			origin: process.env.VITE_CLIENT_BASE_URL,
		},
	});

	// Express functions

	app.use(function (_req, res, next) {
		res.header("Access-Control-Allow-Origin", process.env.VITE_CLIENT_BASE_URL);
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	app.get("/api/rooms/:id", async (req, res) => {
		const hyperbeam_session_id = await db.room.findFirst({ where: { room_id: req.params.id } }).then(room => room?.hb_session_id);
		if (!hyperbeam_session_id)
			return res.status(404).send("Room not found");
		const hbResponse = await fetch(
			`https://enginetest.hyperbeam.com/v0/vm/${hyperbeam_session_id}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.HYPERBEAM_API_KEY}`,
				},
			},
		);
		if (!hbResponse.ok) {
			return res.status(500).send("Internal Server Error");
		}
		res.setHeader("Content-Type", "application/json");
		const { embed_url } = await hbResponse.json();
		res.send({ embed_url });
	});

	// Socket functions

	io.on("connection", (socket) => {
		socket.on("join", async (room_id) => {
			const room = await db.room.findFirst({ where: { room_id } });
			if (!room)
				return socket.emit("error", "Room not found");
			socket.join(room_id);
			socket.emit("joined", room);
		});
		socket.on("leave", async (room_id) => {
			socket.leave(room_id);
		});
	});

	return { app, httpServer, io };
}

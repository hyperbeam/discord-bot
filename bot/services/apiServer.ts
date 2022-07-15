import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import Database from "./db";
import Discord from "discord-oauth2";
import { nanoid } from "nanoid";


export default function apiServer(db: Database) {
	const app = express();
	const httpServer = createServer(app);
	const io = new Server(httpServer, {
		serveClient: false,
		cors: {
			origin: process.env.VITE_CLIENT_BASE_URL,
		},
	});
	const discord = new Discord({
		clientId: process.env.DISCORD_CLIENT_ID,
		clientSecret: process.env.DISCORD_CLIENT_SECRET,
		redirectUri: process.env.VITE_CLIENT_BASE_URL + "/authorize",
	});
	// Express functions

	app.use(function (req, res, next) {
		const headers = {
			"Access-Control-Allow-Origin": process.env.VITE_CLIENT_BASE_URL,
			"Access-Control-Allow-Headers": "Content-Type, Origin, Authorization, Accept, X-Requested-With",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Credentials": "true",
		};
		if (req.method === "OPTIONS") {
			res.writeHead(204, headers);
			res.end();
			return;
		}
		for (const [key, value] of Object.entries(headers)) {
			res.header(key, value);
		}
		next();
	});

	app.get("/authorize/:code", async (req, res) => {
		if (!req.params.code)
			return res.status(400).send("No code provided");
		const tokenResponse: Discord.TokenRequestResult = await fetch("https://discordapp.com/api/oauth2/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: req.params.code,
				redirect_uri: process.env.VITE_CLIENT_BASE_URL! + "/authorize",
				client_id: process.env.DISCORD_CLIENT_ID!,
				client_secret: process.env.DISCORD_CLIENT_SECRET!,
			}).toString(),
		}).then(response => response.json());
		if (!tokenResponse.access_token || !tokenResponse.refresh_token)
			return res.status(400).send({ error: "Invalid token response" });
		const user = await discord.getUser(tokenResponse.access_token);
		if (!user) return res.status(400).send({ error: "Invalid user" });
		const dbUser = await db.upsertUser({
			userId: user.id,
			username: user.username,
			discriminator: user.discriminator,
			avatar: user.avatar,
			refreshToken: tokenResponse.refresh_token,
			accessToken: tokenResponse.access_token,
			hash: nanoid(),
			email: user.email,
		});
		return res.status(200).send({
			...user,
			userId: user.id,
			hash: dbUser.hash,
		});
	});

	app.get("/api/rooms/:roomurl", async (req, res) => {
		const room = await db.getRoom({ url: req.params.roomurl });
		if (!room)
			return res.status(404).send("Room not found");
		let session = await db.getLatestSession({ id: room.id });
		if (!session)
			session = await db.createHyperbeamSession(room.url);
		return res.status(200).json(session);
	});

	// Socket functions

	// io.on("connection", (socket) => {
	// 	socket.on("join", async (room_id) => {
	// 		const room = await db.room.findFirst({ where: { room_id } });
	// 		if (!room)
	// 			return socket.emit("error", "Room not found");
	// 		socket.join(room_id);
	// 		socket.emit("joined", room);
	// 	});
	// 	socket.on("leave", async (room_id) => {
	// 		socket.leave(room_id);
	// 	});
	// });

	return { app, httpServer, io };
}

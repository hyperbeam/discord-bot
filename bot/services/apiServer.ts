import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import Database from "./db";
import Discord from "discord-oauth2";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { pick } from "../utils/helpers";
import session from "express-session";
import { Request, Response, NextFunction } from "express";

export default function apiServer(db: Database) {
	const app = express();
	const httpServer = createServer(app);

	const sessionMiddleware = session({
		secret: process.env.DISCORD_CLIENT_SECRET,
		resave: false,
		saveUninitialized: false,
	});

	app.use(sessionMiddleware);

	const io = new Server(httpServer, {
		cors: {
			origin: process.env.VITE_CLIENT_BASE_URL,
			methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		},
	});

	io.use((socket, next) => {
		sessionMiddleware(socket.request as Request, {} as Response, next as NextFunction);
	});

	const discord = new Discord({
		clientId: process.env.DISCORD_CLIENT_ID,
		clientSecret: process.env.DISCORD_CLIENT_SECRET,
		redirectUri: process.env.VITE_CLIENT_BASE_URL + "/authorize",
	});

	const verifyUser = async (token: string) => {
		let decoded;
		try {
			decoded = jwt.decode(token);
		} catch (e) {
			console.error(e);
		}
		if (typeof decoded !== "object") return null;
		if (!decoded.userId) return null;
		const user = await db.getUser({ userId: decoded.userId });
		if (!user)
			throw new Error("Invalid token");
		if (!jwt.verify(token, user.hash!))
			throw new Error("Invalid token");
		return user;
	};

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
		Object.entries(headers).forEach(([key, value]) => res.header(key, value));
		next();
	});

	app.get("/authorize/:code", async (req, res) => {
		if (!req.params.code)
			return res.status(400).send({ error: "No code provided" });
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
		const token = jwt.sign({ userId: dbUser.userId }, dbUser.hash!);
		req.session.authenticated = true;
		return res.status(200).send(pick({ ...dbUser, token }, "userId", "username", "discriminator", "avatar", "email", "token"));
	});

	app.get("/login", async (req, res) => {
		const authHeader = req.headers.authorization;
		if (!authHeader) return res.status(400).send({ error: "No authorization header" });
		const token = authHeader.split(" ")[1];
		if (!token) return res.status(400).send({ error: "No token provided" });
		const user = await verifyUser(token);
		req.session.authenticated = true;
		return res.status(200).send(pick({ ...user, token }, "userId", "username", "discriminator", "avatar", "email", "token"));
	});

	app.get("/logout", async (req, res) => {
		req.session.authenticated = false;
		const sessionId = req.session.id;
		req.session.destroy(() => {
			io.to(sessionId).disconnectSockets();
			res.status(204).end();
		});
	});

	app.get("/rooms", async (req, res) => {
		if (!req.headers.authorization)
			return res.status(401).send({ error: "Not authorized." });
		const token = req.headers.authorization.split(" ")[1];
		if (!token)
			return res.status(400).send({ error: "No token provided" });
		try { jwt.decode(token); } catch (e) { return res.status(400).send({ error: "Invalid token" }); }
		const user = await verifyUser(token);
		if (!user) return res.status(400).send({ error: "Invalid user" });
		const roomPick = room => pick(room, "name", "url", "ownerId", "createdAt");
		const ownedRooms = await db.getRooms({ ownerId: user.userId }).then(rooms => rooms.map(roomPick));
		const memberRooms = await db.getRooms({ RoomMembers: { some: { userId: user.userId } } }).then(rooms => rooms.map(roomPick));
		return res.status(200).send({ ownedRooms, memberRooms });
	});

	app.get("/:roomurl", async (req, res) => {
		const room = await db.getRoom({ url: req.params.roomurl });
		if (!room)
			return res.status(404).send({ error: "Room not found" });
		let session = await db.getLatestSession({ id: room.id });
		if (session) {
			const sessionResponse = await fetch(session.embedUrl);
			if (sessionResponse.ok)
				return res.status(200).json(session);
			else session = null;
		}
		if (!session)
			session = await db.createHyperbeamSession(room.url);
		return res.status(200).json(session);
	});

	io.use((socket, next) => {
		const session = socket.request.session;
		if (session && session.authenticated) {
			next();
		} else {
			next(new Error("unauthorized"));
		}
	});

	io.on("connection", socket => console.log(socket.request.session));

	return { app, httpServer, io };
}

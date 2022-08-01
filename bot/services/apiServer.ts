import { cors } from "cors";
import express from "express";
import { Server as SocketServer } from "socket.io";
import { createServer, Server as HttpServer } from "http";
import Database from "./db";
import Discord from "discord-oauth2";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { publicObject } from "../utils/helpers";
import session from "express-session";
import { Request, Response, NextFunction, Application } from "express";
import morgan from "morgan";
import fetch from "node-fetch";
import createMemoryStore from "memorystore";

interface APIServer {
	io: SocketServer;
	app: Application;
	httpServer: HttpServer;
}

// most of the api stuff is in here
// TODO: add logging, get sockets working

export default function apiServer(db: Database): APIServer {
	const app = express();
	const httpServer = createServer(app);
	const sessionStore = createMemoryStore(session);

	const sessionMiddleware = session({
		store: new sessionStore({
			checkPeriod: 86400000, // prune expired entries every 24h
		}) as session.MemoryStore,
		secret: process.env.DISCORD_CLIENT_SECRET,
		resave: false,
		saveUninitialized: false,
	});

	app.use(sessionMiddleware);

	// OPTIONS preflight req type is needed to check if cors is viable
	const io = new SocketServer(httpServer, {
		cors: {
			origin: process.env.VITE_CLIENT_BASE_URL,
			methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		},
	});

	// for type hints
	io.use((socket, next) => {
		sessionMiddleware(socket.request as Request, {} as Response, next as NextFunction);
	});

	// make sure you set the redirect uri to the same url as the one in the discord app
	const discord = new Discord({
		clientId: process.env.DISCORD_CLIENT_ID,
		clientSecret: process.env.DISCORD_CLIENT_SECRET,
		redirectUri: process.env.VITE_CLIENT_BASE_URL + "/authorize",
	});

	// verify jwt token against user hash
	// hash isn't sent back to the client
	const verifyUser = async (token: string) => {
		let decoded;
		try {
			decoded = jwt.decode(token);
		} catch (e) {
			console.error(e);
		}
		if (typeof decoded !== "object") return null;
		if (!decoded.id) return null;
		const user = await db.getUser({ id: decoded.id });
		if (!user)
			throw new Error("Invalid token: User not found");
		if (!user.hash)
			throw new Error("Invalid token: Not logged in");
		if (!jwt.verify(token, user.hash!))
			throw new Error("Invalid token: Verification failed");
		return user;
	};

	// Express functions

	app.use(morgan("dev"));

	app.use(cors({
		origin: process.env.VITE_CLIENT_BASE_URL,
		methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Origin"],
		credentials: true,
	}));

	app.get("/authorize/:code", async (req, res) => {
		if (!req.params.code)
			return res.status(400).send({ error: "No code provided" });
		// the package's request function is a bit weird, so we need to use the raw request
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
		}).then(response => response.json() as unknown as Discord.TokenRequestResult);

		// we should get back an access and refresh token
		if (!tokenResponse.access_token || !tokenResponse.refresh_token)
			return res.status(400).send({ error: "Invalid token response" });

		// get the user info from the discord api
		const user = await discord.getUser(tokenResponse.access_token);
		if (!user) return res.status(400).send({ error: "Invalid user" });
		const dbUser = await db.upsertUser({
			id: user.id,
			username: user.username,
			discriminator: user.discriminator,
			avatar: user.avatar,
			refreshToken: tokenResponse.refresh_token,
			accessToken: tokenResponse.access_token,
			hash: nanoid(),
			email: user.email,
		});

		// send back token and user info
		const token = jwt.sign({ id: dbUser.id }, dbUser.hash!);
		req.session.authenticated = true;
		return res.status(200).send({
			...publicObject.user(dbUser),
			token,
		});
	});

	app.get("/login", async (req, res) => {
		// token is sent in the header
		const authHeader = req.headers.authorization;
		if (!authHeader) return res.status(400).send({ error: "No authorization header" });
		const token = authHeader.split(" ")[1];
		if (!token) return res.status(400).send({ error: "No token provided" });
		// decode and verify token against user hash
		try {
			const user = await verifyUser(token);
			if (user) {
				req.session.authenticated = true;
				const rooms = await db.getRooms({
					ownerId: user.id,
					OR: {
						RoomMembers: {
							some: { userId: user.id },
						},
					},
				}).then(rooms => rooms.map(publicObject.room));
				res.status(200).send({
					...publicObject.user(user),
					rooms,
					token,
				});
			}
		}
		catch (error) {
			console.error(error);
			res.status(400).send({ error });
		}
	});

	// TODO: implement this clientside
	app.get("/logout", async (req, res) => {
		req.session.authenticated = false;
		const sessionId = req.session.id;
		req.session.destroy(() => {
			io.to(sessionId).disconnectSockets();
			res.status(204).end();
		});
	});

	app.get("/rooms", async (req, res) => {
		// verify user first
		if (!req.headers.authorization)
			return res.status(401).send({ error: "Not authorized." });
		const token = req.headers.authorization.split(" ")[1];
		if (!token)
			return res.status(400).send({ error: "No token provided" });
		try { jwt.decode(token); } catch (e) { return res.status(400).send({ error: "Invalid token" }); }
		const user = await verifyUser(token);
		if (!user) return res.status(400).send({ error: "Invalid user" });
		req.session.authenticated = true;
		// get all rooms for room list
		const rooms = await db.getRooms({
			ownerId: user.id,
			OR: {
				RoomMembers: {
					some: { userId: user.id },
				},
			},
		}).then(rooms => rooms.map(publicObject.room));
		return res.status(200).send({ rooms });
	});

	app.get("/room/:roomurl", async (req, res) => {
		// TODO: verify only if room requires auth
		const room = await db.getRoom({ url: req.params.roomurl });
		if (!room)
			return res.status(404).send({ error: "Room not found" });
		if (room.requiresAuth) {
			// verify user first
			if (!req.headers.authorization)
				return res.status(401).send({ error: "Not authorized: Room requires authorization." });
			const token = req.headers.authorization.split(" ")[1];
			if (!token)
				return res.status(400).send({ error: "No token provided: Room requires authorization." });
			try { jwt.decode(token); } catch (e) { return res.status(400).send({ error: "Invalid token" }); }
			try { await verifyUser(token); } catch (e) { return res.status(400).send({ error: e }); }
		}

		// TODO: optimize this flow
		// currently there's like 3 queries per request, all async
		// takes like 3 seconds to load the page

		// get session if it already exists
		let session = await db.getLatestSession({ id: room.id });
		if (session) {
			const sessionResponse = await fetch(session.embedUrl);
			if (sessionResponse.ok)
				return res.status(200).json({ ...publicObject.room(room), session: publicObject.session(session) });
			else session = null;
		}
		// if the session is expired, make a new session
		if (!session)
			session = await db.createHyperbeamSession(room.url);

		// TODO: send admin token only to room owner
		return res.status(200).json({ ...publicObject.room(room), session: publicObject.session(session) });
	});

	io.use((socket, next) => {
		// socket auth check
		const session = socket.request.session;
		if (session && session.authenticated) {
			next();
		} else {
			next(new Error("unauthorized"));
		}
	});

	// TODO: implement this clientside
	io.on("connection", socket => {
		console.log(`Websocket connection: ${socket.id}`);
		socket.on("disconnect", () => {
			console.log(`Websocket disconnection: ${socket.id}`);
		});
	});

	return { app, httpServer, io };
}

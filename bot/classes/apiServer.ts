import cors from "cors";
import express, { Application } from "express";
import { createServer, Server as HttpServer } from "http";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import TokenHandler from "../utils/tokenHandler";
import Sanitize from "../utils/sanitize";
import { authorize } from "./discord";

interface APIServer {
	app: Application;
	httpServer: HttpServer;
}

export default function apiServer(db: PrismaClient): APIServer {
	const app = express();
	const httpServer = createServer(app);

	// Express functions

	app.use(morgan("dev"));

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

	app.get("/login", async (req, res) => {
		// token is sent in the header
		const authHeader = req.headers.authorization;
		if (!authHeader) return res.status(400).send({ error: "No authorization header" });
		const token = authHeader.split(" ")[1];
		if (!token) return res.status(400).send({ error: "No token provided" });
		// decode and verify token against user hash
		try {
			const result = TokenHandler.verify(token);
			if (!result) return res.status(400).send({ error: "Invalid token" });

			const user = await db.user.findUnique({
				where: {
					id: result.id,
				},
			});
			if (!user) return res.status(400).send({ error: "Invalid user" });
			if (!result.verify(user)) return res.status(400).send({ error: "Invalid token" });

			if (user) {
				req.session.authenticated = true;
				return res.status(200).send({
					...Sanitize.user(user),
					token,
				});
			}
		} catch (error) {
			console.error(error);
			res.status(400).send({ error });
		}
	});

	// TODO: implement this clientside
	app.get("/logout", async (req, res) => {
		req.session.authenticated = false;
		req.session.destroy(() => {
			res.status(204).end();
		});
	});

	app.get("/sessions/:url", async (req, res) => {
		const url = req.params.url;
		if (!url) return res.status(400).send({ error: "No url provided" });
		if (typeof url !== "string") return res.status(400).send({ error: "Invalid url" });
		const session = await db.session.findFirst({ where: { url } });
		if (!session) return res.status(404).send({ error: "Session not found" });
		return res.status(200).send(Sanitize.session(session));
	});

	return { app, httpServer };
}

import { PrismaClient } from "@prisma/client";
import express from "express";

export default function apiServer(db: PrismaClient) {
	const app = express();

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

	return app;
}

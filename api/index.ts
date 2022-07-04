import Database from "better-sqlite3";
import dotenv from "dotenv";
import express from "express";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const database = new Database(path.join(__dirname, "../../database.db"));
database
	.prepare(
		"CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, hyperbeam_session_id TEXT)",
	)
	.run();

const app = express();

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "localhost:4000");
	res.header("Access-Control-Allow-Origin", "https://localhost:4000");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get("/api/rooms/:id", async (req, res) => {
	const { hyperbeam_session_id } = database
		.prepare("SELECT hyperbeam_session_id FROM rooms WHERE id = ?")
		.get(req.params.id);
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

app.listen(3000, () => {
	console.log("Listening on port 3000");
});

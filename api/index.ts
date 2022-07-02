import Database from "better-sqlite3";
import dotenv from "dotenv";
import express from "express";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const database = new Database(process.env.DATABASE_PATH!);
database
  .prepare(
	"CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, hyperbeam_session_id TEXT)"
  )
  .run();

const app = express();

app.get("/api/rooms/:id", async (req, res) => {
  const { hyperbeam_session_id } = database
	.prepare("SELECT hyperbeam_session_id FROM rooms WHERE id = ?")
	.get(req.params.id);
  const response = await fetch(
	`https://enginetest.hyperbeam.com/v0/vm/${hyperbeam_session_id}`,
	{
	  headers: {
		Authorization: `Bearer ${process.env.HYPERBEAM_API_KEY}`,
	  },
	}
  );
  if (!response.ok) {
	return res.status(500).send("Internal Server Error");
  }
  res.setHeader("Content-Type", "application/json");
  res.send((await response.json()).embed_url);
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Fetch workshops
app.get("/api/workshops", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM workshops");
  res.json(rows);
});

// Book a workshop
app.post("/api/book", async (req, res) => {
  const { workshopId } = req.body;
  await db.execute("UPDATE workshops SET seats = seats - 1 WHERE id = ?", [workshopId]);
  res.json({ message: "Workshop booked!" });
});

app.listen(5000, () => console.log("Server running on port 5000"));

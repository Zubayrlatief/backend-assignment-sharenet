import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0
});

app.get("/api/workshops", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM workshops");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching workshops:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/book", async (req, res) => {
  const { workshopId } = req.body;
  try {
    const [result] = await db.execute("UPDATE workshops SET seats = seats - 1 WHERE id = ?", [workshopId]);
    
    if (result.affectedRows > 0) {
      res.json({ message: "Workshop booked!" });
    } else {
      res.status(404).json({ error: "Workshop not found" });
    }
  } catch (error) {
    console.error("Error booking workshop:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

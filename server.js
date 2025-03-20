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

db.getConnection()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1); 
  });

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

app.get("/api/workshops", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM workshops WHERE seats > 0");  // Filter only workshops with available seats
    res.json(rows);
  } catch (error) {
    console.error("Error fetching workshops:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Book a workshop
app.post("/api/book", async (req, res) => {
  const { workshopId } = req.body;
  try {
    const [workshop] = await db.execute("SELECT seats FROM workshops WHERE id = ?", [workshopId]);

    if (workshop.length === 0) {
      return res.status(404).json({ error: "Workshop not found" });
    }

    if (workshop[0].seats <= 0) {
      return res.status(400).json({ error: "No seats available" });
    }

    const [result] = await db.execute("UPDATE workshops SET seats = seats - 1 WHERE id = ?", [workshopId]);

    if (result.affectedRows > 0) {
      res.json({ message: "Workshop booked!" });
    } else {
      res.status(500).json({ error: "Failed to book workshop" });
    }
  } catch (error) {
    console.error("Error booking workshop:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.use(cors({
  origin: "https://assignment-sharenet.vercel.app",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

// Server setup
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

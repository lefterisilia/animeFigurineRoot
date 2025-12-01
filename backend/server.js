// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        ok: true,
        message: "Anime Figurine API (Neon Postgres) is running",
    });
});

// GET /figurines - list all figurines
app.get("/figurines", async (req, res) => {
    try {
        const result = await query(
            "SELECT id, name, price, description, image_url FROM figurines ORDER BY id"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching figurines:", err);
        res.status(500).json({ error: "Failed to fetch figurines" });
    }
});

// POST /figurines - add a new figurine
// body: { name, price, description, image_url }
app.post("/figurines", async (req, res) => {
    const { name, price, description, image_url } = req.body;

    if (!name || price == null) {
        return res.status(400).json({ error: "name and price are required" });
    }

    try {
        const result = await query(
            `INSERT INTO figurines (name, price, description, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, price, description, image_url`,
            [name, price, description, image_url]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error inserting figurine:", err);
        res.status(500).json({ error: "Failed to insert figurine" });
    }
});

app.listen(PORT, () => {
    console.log(
        `Anime Figurine API (Neon) listening on http://localhost:${PORT}`
    );
});

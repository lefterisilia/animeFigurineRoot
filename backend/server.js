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

// const bcrypt = require("bcrypt");  // <-- enable later when DB is hashed

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        // Fetch user by email
        const result = await query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        // No user found
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const user = result.rows[0];

        // -----------------------------
        // Plain-text password check FOR NOW
        // -----------------------------
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // -----------------------------
        // BCRYPT VERSION (enable later)
        // const match = await bcrypt.compare(password, user.password);
        // if (!match) {
        //    return res.status(401).json({ error: "Invalid email or password" });
        // }
        // -----------------------------
        // Remove password before sending to client
        const { password: _, ...safeUser } = user;

        return res.json(safeUser);
    } catch (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ error: "Failed to fetch user" });
    }
});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`API listening on http://0.0.0.0:${PORT}`);
});


// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./supabaseClient.js";

dotenv.config(); // load .env

const app = express();
const PORT = process.env.PORT || 4000;

// basic middleware
app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
    res.json({ ok: true, message: "Anime Figurine API is running" });
});

/**
 * GET /figurines
 * returns all figurines
 */
app.get("/figurines", async (req, res) => {
    const { data, error } = await supabase.from("figurines").select("*");

    if (error) {
        console.error("Error fetching figurines:", error);
        return res.status(500).json({ error: "Failed to fetch figurines" });
    }

    res.json(data);
});

/**
 * POST /figurines
 * body: { name, price, description, image_path }
 * (image_path will be a path in Supabase Storage, e.g. "gojo.png")
 */
app.post("/figurines", async (req, res) => {
    const { name, price, description, image_path } = req.body;

    if (!name || price == null) {
        return res.status(400).json({ error: "name and price are required" });
    }

    const { data, error } = await supabase
        .from("figurines")
        .insert([{ name, price, description, image_url: image_path }]) // using your column name image_url
        .select()
        .single();

    if (error) {
        console.error("Error inserting figurine:", error);
        return res.status(500).json({ error: "Failed to insert figurine" });
    }

    res.status(201).json(data);
});

app.listen(PORT, () => {
    console.log(`Anime Figurine API listening on http://localhost:${PORT}`);
});

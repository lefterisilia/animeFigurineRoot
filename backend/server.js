// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import { generateRandomPin, sendPinEmail } from './SendEmailFunctions.js';
import bcrypt from 'bcryptjs';

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

app.post('/ResetPassword', async (req, res) => {
    const { email, newPassword } = req.body || {};
    if(typeof email !== 'string' || !email.trim()){
        return res.status(400).json({ error: 'Email is required.' });
    }
    if(typeof newPassword !== 'string' || !newPassword.trim()){
        return res.status(400).json({ error: 'New password is required.' });
    }
    try {
        const result = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase().trim()]);
        if (result.rows.length > 0) {
            // hash the new password before saving
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(newPassword, saltRounds);
            await query('UPDATE users SET password = $1 WHERE email = $2', [passwordHash, email.toLowerCase().trim()]);
            return res.status(200).json({ message: 'Password updated successfully.' });
        }
        else {
            return res.status(404).json({ error: 'User not found.' });
        }
    }catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
})

app.post('/VerifyPin', async (req, res) => {
    const { email, code } = req.body || {};
    if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ error: 'Email is required.' });
    }
    if (typeof code !== 'string' && typeof code !== 'number') {
        return res.status(400).json({ error: 'Code is required.' });
    }
    try {
        const normalizedEmail = String(email).toLowerCase().trim();
        const providedCode = String(code).trim();

        const result = await query(
            'SELECT otp FROM users WHERE email = $1 LIMIT 1',
            [normalizedEmail]
        );

        if (result.rows.length > 0) {
            const dbOtp = result.rows[0].otp;  // 👈 get the first row's otp

            if (String(dbOtp).trim() === providedCode) {
                await query('UPDATE users SET otp = NULL  WHERE email = $1', [normalizedEmail]);
                return res.status(200).json({
                    success: true,
                    message: 'OTP verified successfully',
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid OTP',
                });
            }
        } else {
            return res.status(404).json({
                success: false,
                message: 'Email not found',
            });
        }
    } catch (err) {
        console.error('VerifyPin error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
})

app.post('/SendPin', async (req, res) => {
    const { email } = req.body || {};
    if(typeof email !== 'string' || !email.trim()){
        return res.status(400).json({ error: 'Email is required.' });
    }
    try {
        const result = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase().trim()]);
        if (result.rows.length > 0) {
            const pin = generateRandomPin(4);
            await query('UPDATE users SET otp = $1 WHERE email = $2', [pin, email]);
            await sendPinEmail(email, pin);

            res.status(200).json({ message: `Pin sent to ${email}.` });
        }else {
            res.status(404).json({ error: 'User not found.' });
        }
    }catch(error) {
        console.error('Error sending PIN email:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
})


// GET /figurines/:id - get details for one figurine
app.get("/figurines/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query(
            "SELECT id, name, price, description, image_url FROM figurines WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Figurine not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching figurine detail:", err);
        res.status(500).json({ error: "Failed to fetch figurine" });
    }
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
app.post("/register", async (req, res) => {
    const { fullname, email, password, confirmPass } = req.body;

    // 1. Validate input
    if (!fullname || !email || !password || !confirmPass) {
        return res.status(400).json({ error: "Please fill in all fields" });
    }

    if (password !== confirmPass) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        // 2. Check if email already exists
        const [rows] = await query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (rows.length > 0) {
            return res.status(409).json({ error: "Email already exists" });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Insert user
        await query(
            `INSERT INTO users (username, email, password, regdate)
             VALUES (?, ?, ?, NOW())`,
            [fullname, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});



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


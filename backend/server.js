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

// POST /signup - create new user account
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please fill in all fields" });
    }

    try {
        // 2. Check if email already exists
        const result = await query(
            "SELECT id FROM users WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (result.rows.length > 0) {
            return res.status(409).json({ error: "Email already exists" });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Insert user
        await query(
            `INSERT INTO users (username, email, password, regdate)
             VALUES ($1, $2, $3, NOW())`,
            [name, email.toLowerCase().trim(), hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "Server error" });
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

        // Verify password using bcrypt
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Remove password before sending to client
        const { password: _, ...safeUser } = user;

        return res.json(safeUser);
    } catch (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ error: "Failed to fetch user" });
    }
});


// Cart endpoints
app.post("/cart/add", async (req, res) => {
    const { userid, productid } = req.body;

    if (!userid || !productid) {
        return res.status(400).json({ error: "userid and productid are required" });
    }

    try {
        // Check if item already exists in cart
        const existing = await query(
            "SELECT * FROM cart WHERE userid = $1 AND productid = $2",
            [userid, productid]
        );

        if (existing.rows.length > 0) {
            // Item already in cart, just return success
            return res.json({ success: true, message: "Item already in cart" });
        }

        // Insert new cart item
        await query(
            "INSERT INTO cart (userid, productid) VALUES ($1, $2)",
            [userid, productid]
        );

        res.json({ success: true, message: "Item added to cart" });
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ error: "Failed to add item to cart" });
    }
});

app.post("/cart/remove", async (req, res) => {
    const { userid, productid } = req.body;

    if (!userid || !productid) {
        return res.status(400).json({ error: "userid and productid are required" });
    }

    try {
        await query(
            "DELETE FROM cart WHERE userid = $1 AND productid = $2",
            [userid, productid]
        );

        res.json({ success: true, message: "Item removed from cart" });
    } catch (err) {
        console.error("Error removing from cart:", err);
        res.status(500).json({ error: "Failed to remove item from cart" });
    }
});

app.get("/cart/:userid", async (req, res) => {
    const { userid } = req.params;

    if (!userid) {
        return res.status(400).json({ error: "userid is required" });
    }

    try {
        const result = await query(
            `SELECT 
                c.id as cart_id,
                c.userid,
                c.productid,
                f.id,
                f.name,
                f.price,
                f.image_url,
                f.description
            FROM cart c
            LEFT JOIN figurines f ON c.productid = f.id
            WHERE c.userid = $1`,
            [userid]
        );

        res.json({ items: result.rows });
    } catch (err) {
        console.error("Error fetching cart:", err);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
});

// Get saved address for a user
app.get("/address/:userid", async (req, res) => {
    const { userid } = req.params;

    if (!userid) {
        return res.status(400).json({ error: "userid is required" });
    }

    try {
        const result = await query(
            "SELECT * FROM shipping WHERE userid = $1",
            [userid]
        );

        if (result.rows.length > 0) {
            res.json({ address: result.rows[0] });
        } else {
            res.json({ address: null });
        }
    } catch (err) {
        console.error("Error fetching address:", err);
        res.status(500).json({ error: "Failed to fetch address" });
    }
});

// Address endpoint for checkout
app.post("/address/save", async (req, res) => {
    const { userid, address, city, postalcode, notes } = req.body;

    if (!userid || !address || !city || !postalcode) {
        return res.status(400).json({ error: "userid, address, city, and postalcode are required" });
    }

    try {
        // Check if address already exists for this user
        const existing = await query(
            "SELECT * FROM shipping WHERE userid = $1",
            [userid]
        );

        if (existing.rows.length > 0) {
            // Update existing address
            await query(
                "UPDATE shipping SET address = $1, city = $2, postalcode = $3, notes = $4 WHERE userid = $5",
                [address, city, postalcode, notes || null, userid]
            );
        } else {
            // Insert new address
            await query(
                "INSERT INTO shipping (userid, address, city, postalcode, notes) VALUES ($1, $2, $3, $4, $5)",
                [userid, address, city, postalcode, notes || null]
            );
        }

        res.json({ success: true, message: "Address saved successfully" });
    } catch (err) {
        console.error("Error saving address:", err);
        res.status(500).json({ error: "Failed to save address" });
    }
});

// Get orders for a specific user
app.get("/orders/:userid", async (req, res) => {
    const { userid } = req.params;

    if (!userid) {
        return res.status(400).json({ error: "userid is required" });
    }

    try {
        // Fetch all orders for the user with shipping details
        const ordersResult = await query(
            `SELECT 
                o.id,
                o.userid,
                o.date,
                o.status,
                o.total,
                s.address,
                s.city,
                s.postalcode,
                s.notes
            FROM orders o
            LEFT JOIN shipping s ON o.shippingid = s.id
            WHERE o.userid = $1
            ORDER BY o.date DESC`,
            [userid]
        );

        // For each order, fetch its products
        const orders = [];
        for (const order of ordersResult.rows) {
            const productsResult = await query(
                `SELECT 
                    op.id as order_product_id,
                    op.productid,
                    f.name,
                    f.price,
                    f.image_url,
                    f.description
                FROM orders_products op
                LEFT JOIN figurines f ON op.productid = f.id
                WHERE op.orderid = $1`,
                [order.id]
            );

            orders.push({
                ...order,
                products: productsResult.rows
            });
        }

        res.json({ orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// Order creation endpoint
app.post("/order/create", async (req, res) => {
    const { userid, address, city, postalcode, notes, cartItems, total } = req.body;

    if (!userid || !address || !city || !postalcode || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // 1. Save or update address and get the address id
        const existingAddress = await query(
            "SELECT id FROM shipping WHERE userid = $1",
            [userid]
        );

        let shippingId;
        if (existingAddress.rows.length > 0) {
            // Update existing address
            await query(
                "UPDATE shipping SET address = $1, city = $2, postalcode = $3, notes = $4 WHERE userid = $5",
                [address, city, postalcode, notes || null, userid]
            );
            shippingId = existingAddress.rows[0].id;
        } else {
            // Insert new address
            const newAddress = await query(
                "INSERT INTO shipping (userid, address, city, postalcode, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id",
                [userid, address, city, postalcode, notes || null]
            );
            shippingId = newAddress.rows[0].id;
        }

        // 2. Create order in orders table
        const orderResult = await query(
            "INSERT INTO orders (userid, shippingid, date, status, total) VALUES ($1, $2, NOW(), $3, $4) RETURNING id",
            [userid, shippingId, "sent", total]
        );
        const orderId = orderResult.rows[0].id;

        // 3. Insert all products into orders_products table
        for (const item of cartItems) {
            await query(
                "INSERT INTO orders_products (orderid, productid) VALUES ($1, $2)",
                [orderId, item.id]
            );
        }

        // 4. Clear the cart
        await query(
            "DELETE FROM cart WHERE userid = $1",
            [userid]
        );

        res.json({ success: true, message: "Order created successfully", orderId });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ error: "Failed to create order" });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API listening on http://0.0.0.0:${PORT}`);
});


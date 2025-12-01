// backend/db.js
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
    return pool.query(text, params);
}

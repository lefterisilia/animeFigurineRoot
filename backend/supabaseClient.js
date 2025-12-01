// backend/supabaseClient.js
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env here so it's ready before we read process.env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
    );
}

export const supabase = createClient(supabaseUrl, serviceKey);

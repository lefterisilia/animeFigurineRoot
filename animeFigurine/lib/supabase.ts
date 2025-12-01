// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yynyfarduvpdbhsoejex.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_csLjokbES6by2CVOzX5Zww_oeYaG8FU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

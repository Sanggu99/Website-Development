import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Robust check: Only create client if keys exist and are not placeholders
const isValid = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your_project_url_here' &&
    !supabaseUrl.includes('placeholder');

if (!isValid) {
    console.warn('Supabase URL or Key is missing or invalid. App will run in LocalStorage mode.');
}

// Create Supabase client only if valid, otherwise null
// This prevents the "White Screen" crash on startup
export const supabase = isValid
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;


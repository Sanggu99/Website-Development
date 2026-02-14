
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

// Quick env parser
const envConfig: any = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) envConfig[key.trim()] = value.trim();
    });
} catch (e) {
    console.log('No .env.local found');
}

const supabaseUrl = envConfig['VITE_SUPABASE_URL'];
const supabaseKey = envConfig['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Attempting to insert a test news item with new columns...");

    const payload = {
        id: 99999, // Test ID
        title: 'Test Column Check',
        date: '2024-01-01',
        category: 'TEST',
        show_as_popup: true, // New Column
        layout_type: 'full-width' // New Column
    };

    const { error } = await supabase.from('news').upsert(payload);

    if (error) {
        console.error("Error inserting:", error);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
            console.log("CONFIRMED: Columns are missing in the database table.");
        }
    } else {
        console.log("Success! Columns exist.");
        // Cleanup
        await supabase.from('news').delete().eq('id', 99999);
    }
}

check();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let envConfig = {};
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envConfig[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.error("Could not read .env.local");
    process.exit(1);
}

const supabaseUrl = envConfig['VITE_SUPABASE_URL'];
const supabaseKey = envConfig['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying Database State...');

    // Projects
    const { count: projectCount, error: pError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

    if (pError) console.error('Error counting projects:', pError);
    else console.log(`Projects: ${projectCount} items found. (Expected ~18)`);

    // News
    const { count: newsCount, error: nError } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });

    if (nError) console.error('Error counting news:', nError);
    else console.log(`News: ${newsCount} items found. (Expected ~10)`);

    // People
    const { count: peopleCount, error: peError } = await supabase
        .from('people')
        .select('*', { count: 'exact', head: true });

    if (peError) console.error('Error counting people:', peError);
    else console.log(`People: ${peopleCount} items found. (Expected ~16)`);

}

verify();

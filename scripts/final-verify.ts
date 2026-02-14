
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

// Quick env parser for testing script
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

async function verifySystem() {
    console.log("=== SEOP Website System Verification ===");
    console.log(`Timestamp: ${new Date().toISOString()}`);

    try {
        // 1. Check Connection & Item Counts
        console.log("\n[1] Checking Database Connection & Counts...");

        // News
        const { data: news, error: newsError } = await supabase.from('news').select('*').order('id');
        if (newsError) throw newsError;
        console.log(`✅ News Items: ${news?.length}`);

        // Projects
        const { data: projects, error: projectsError } = await supabase.from('projects').select('*');
        if (projectsError) throw projectsError;
        console.log(`✅ Projects: ${projects?.length}`);

        // People
        const { data: people, error: peopleError } = await supabase.from('people').select('*');
        if (peopleError) throw peopleError;
        console.log(`✅ People: ${people?.length}`);

        // 2. Verify News Columns (Recent Fix)
        console.log("\n[2] Verifying News Schema Updates...");
        if (news && news.length > 0) {
            const item = news[0];
            const requiredCols = ['show_as_popup', 'external_link', 'layout_type', 'aspect_ratio'];
            const missing = requiredCols.filter(col => item[col] === undefined);

            if (missing.length === 0) {
                console.log("✅ All new columns (show_as_popup, layout_type, etc.) are present and accessible.");
            } else {
                console.error("❌ MISSING COLUMNS detected in runtime check:", missing);
                console.log("   (This might mean the SQL migration didn't run or Supabase types are cached remotely?)");
            }
        } else {
            console.warn("⚠️ No news items to check columns against. Attempting dummy insert...");
            // Dummy insert/delete to check schema
            const { error: insertError } = await supabase.from('news').insert({
                id: 999999,
                title: 'Schema Check',
                date: '2024-01-01',
                show_as_popup: false
            });

            if (insertError) {
                console.error("❌ Schema Validation Failed:", insertError.message);
            } else {
                console.log("✅ Schema Validation Passed (Insert with new column succeeded).");
                await supabase.from('news').delete().eq('id', 999999);
            }
        }

        // 3. Data Integrity Check
        console.log("\n[3] Checking Data Integrity...");
        const nullIdNews = news?.filter(n => !n.id).length || 0;
        const nullIdProjects = projects?.filter(p => !p.id).length || 0;

        if (nullIdNews > 0 || nullIdProjects > 0) {
            console.error(`❌ Found items with NULL IDs! News: ${nullIdNews}, Projects: ${nullIdProjects}`);
        } else {
            console.log("✅ No NULL IDs found.");
        }

        console.log("\n=== Verification Complete: SYSTEM ONLINE ===");

    } catch (e: any) {
        console.error("\n❌ SYSTEM VERIFICATION FAILED:", e.message);
    }
}

verifySystem();

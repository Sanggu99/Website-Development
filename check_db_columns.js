
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Construct the absolute path to the .env file
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
    console.log('Checking project table columns...');

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching projects:', error);
        return;
    }

    if (data && data.length > 0) {
        const project = data[0];
        const keys = Object.keys(project);
        console.log('Available columns in "projects" table:');
        console.log(keys.join(', '));

        const hasPosition = keys.includes('thumbnail_object_position');
        const hasScale = keys.includes('thumbnail_scale');

        console.log('\n--- Status ---');
        console.log(`thumbnail_object_position: ${hasPosition ? 'EXISTS' : 'MISSING'}`);
        console.log(`thumbnail_scale: ${hasScale ? 'EXISTS' : 'MISSING'}`);
    } else {
        console.log('No projects found to check columns.');
    }
}

checkColumns();

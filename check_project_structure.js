import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jmgrqtjivjkqnrtkymwq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ3JxdGppdmprcW5ydGt5bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mzk5NDUsImV4cCI6MjA4NjMxNTk0NX0.lwJel7F_w1GEA11r-xpUGMzoNyAyxcmekFMUQDi6bz4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkProjectStructure() {
    console.log('Checking project data structure...');

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (projects && projects.length > 0) {
        console.log('\nFirst project data:');
        console.log(JSON.stringify(projects[0], null, 2));
    }
}

checkProjectStructure();

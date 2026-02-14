
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jmgrqtjivjkqnrtkymwq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ3JxdGppdmprcW5ydGt5bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mzk5NDUsImV4cCI6MjA4NjMxNTk0NX0.lwJel7F_w1GEA11r-xpUGMzoNyAyxcmekFMUQDi6bz4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkProjects() {
    console.log('Checking database...');

    // Check total count
    const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error fetching count:', error);
    } else {
        console.log(`Found ${count} projects in database.`);
    }

    // Check latest projects
    const { data: latest, error: listError } = await supabase
        .from('projects')
        .select('id, title')
        .order('id', { ascending: false })
        .limit(5);

    if (listError) {
        console.error('Error fetching list:', listError);
    } else if (latest) {
        console.log('\nTop 5 Latest Projects:');
        latest.forEach(p => console.log(`- ID ${p.id}: ${p.title}`));
    }
}

checkProjects();

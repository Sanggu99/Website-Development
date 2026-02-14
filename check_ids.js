
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmgrqtjivjkqnrtkymwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ3JxdGppdmprcW5ydGt5bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mzk5NDUsImV4cCI6MjA4NjMxNTk0NX0.lwJel7F_w1GEA11r-xpUGMzoNyAyxcmekFMUQDi6bz4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIds() {
    const { data: projects, error } = await supabase
        .from('projects')
        .select('id, title, title_en')
        .order('id');

    if (error) console.error(error);
    else console.log(projects);
}

checkIds();

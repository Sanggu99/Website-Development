// Diagnostic script to check data status
// Open browser console and paste this script

console.log('=== SEOP Project Data Diagnostic ===');

// Check localStorage
const storedProjects = localStorage.getItem('seop_projects');
const storedNews = localStorage.getItem('seop_news');
const storedPeople = localStorage.getItem('seop_people');

console.log('\n1. LocalStorage Status:');
console.log('Projects:', storedProjects ? JSON.parse(storedProjects).length + ' items' : 'NOT FOUND or EMPTY');
console.log('News:', storedNews ? JSON.parse(storedNews).length + ' items' : 'NOT FOUND or EMPTY');
console.log('People:', storedPeople ? JSON.parse(storedPeople).length + ' items' : 'NOT FOUND or EMPTY');

// Check contentService
console.log('\n2. ContentService Status:');
import { contentService } from './src/services/contentService';
const projects = contentService.getProjects();
const news = contentService.getNews();
const people = contentService.getPeople();

console.log('Projects in memory:', projects.length);
console.log('News in memory:', news.length);
console.log('People in memory:', people.length);

// Show first few projects if any exist
if (projects.length > 0) {
    console.log('\nFirst 3 projects:');
    projects.slice(0, 3).forEach(p => {
        console.log(`- ID ${p.id}: ${p.title}`);
    });
} else {
    console.log('\n⚠️ NO PROJECTS FOUND IN MEMORY');
}

// Check if Supabase is connected
console.log('\n3. Supabase Connection:');
import { supabase } from './src/supabaseClient';
if (supabase) {
    console.log('✓ Supabase client is initialized');

    // Try to fetch from database
    supabase.from('projects').select('id, title').limit(5).then(({ data, error }) => {
        if (error) {
            console.error('❌ Supabase query error:', error);
        } else {
            console.log('✓ Database accessible, sample projects:', data?.length || 0);
            if (data) {
                data.forEach(p => console.log(`  - ID ${p.id}: ${p.title}`));
            }
        }
    });
} else {
    console.log('❌ Supabase client NOT initialized');
}

console.log('\n=== End Diagnostic ===');

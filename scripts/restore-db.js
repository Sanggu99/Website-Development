
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Load Environment Variables from .env.local
const envPath = path.join(rootDir, '.env.local');
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

// 2. Load Projects
const projectsDir = path.join(rootDir, 'src/content/projects');
const projectFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.json'));
let projects = [];

for (const f of projectFiles) {
    const content = fs.readFileSync(path.join(projectsDir, f), 'utf8');
    const json = JSON.parse(content);
    // Flatten groups like in data.ts
    const flattened = {
        ...json,
        ...(json.basic_group || {}),
        ...(json.visual_group || {}),
        ...(json.details_group || {}),
        ...(json.gallery_group || {}),
    };
    // Exclude Wonik Holdings (ID 19) as per data.ts logic
    if (flattened.id !== 19) {
        projects.push(flattened);
    }
}
// Sort by ID desc
projects.sort((a, b) => b.id - a.id);

// 3. Load News
const newsDir = path.join(rootDir, 'src/content/news');
const newsFiles = fs.readdirSync(newsDir).filter(f => f.endsWith('.json'));
let newsList = [];

for (const f of newsFiles) {
    const content = fs.readFileSync(path.join(newsDir, f), 'utf8');
    const json = JSON.parse(content);
    // Flatten content_group
    const flattened = {
        ...json,
        ...(json.basic_group || {}),
        ...(json.content_group || {}),
    };
    newsList.push(flattened);
}
newsList.sort((a, b) => b.id - a.id);

// 4. Initial People (Hardcoded)
const initialPeople = Array(16).fill({
    name_en: 'SANGSUN PARK',
    name_kr: '박상선',
    role: 'CEO',
    image_bw: '/people/흑백/박상선.jpg',
    image_color: '/people/컬러/박상선.JPG'
}).map((p, i) => ({ ...p, id: i + 1 }));

// 5. Restore Function
async function restore() {
    console.log('Restoring DB...');

    // --- Projects ---
    console.log('Clearing Projects...');
    const { error: delProj } = await supabase.from('projects').delete().neq('id', 0);
    if (delProj) console.error('Error clearing projects:', delProj);

    console.log(`Inserting ${projects.length} Projects...`);
    // Map to snake_case for DB
    const dbProjects = projects.map((p, i) => ({
        id: i + 1, // Sequential ID
        title: p.title,
        title_en: p.titleEn,
        location: p.location,
        year: p.year,
        hero_image: p.heroImage,
        category: Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []),
        facts: p.facts,
        blocks: p.blocks,
        gallery_images: p.galleryImages,
        description: p.description
    }));
    const { error: insProj } = await supabase.from('projects').insert(dbProjects);
    if (insProj) console.error('Error inserting projects:', insProj);
    else console.log('Projects restored.');

    // --- News ---
    console.log('Clearing News...');
    const { error: delNews } = await supabase.from('news').delete().neq('id', 0);
    if (delNews) console.error('Error clearing news:', delNews);

    console.log(`Inserting ${newsList.length} News...`);
    const dbNews = newsList.map((n, i) => ({
        id: i + 1,
        title: n.title,
        summary: n.summary,
        date: n.date,
        category: n.category,
        image: n.image,
        content: n.content
    }));
    const { error: insNews } = await supabase.from('news').insert(dbNews);
    if (insNews) console.error('Error inserting news:', insNews);
    else console.log('News restored.');

    // --- People ---
    console.log('Clearing People...');
    const { error: delPeople } = await supabase.from('people').delete().neq('id', 0);
    if (delPeople) console.error('Error clearing people:', delPeople);

    console.log(`Inserting ${initialPeople.length} People...`);
    const { error: insPeople } = await supabase.from('people').insert(initialPeople);
    if (insPeople) console.error('Error inserting people:', insPeople);
    else console.log('People restored.');

    console.log('Done!');
}

restore();

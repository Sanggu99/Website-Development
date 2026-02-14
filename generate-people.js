import fs from 'fs';
import path from 'path';

const peopleDir = path.join(process.cwd(), 'src/content/people');

if (!fs.existsSync(peopleDir)) {
    fs.mkdirSync(peopleDir, { recursive: true });
}

// Clear existing to avoid duplicates if needed, or just overwrite/add
// For now, let's just ensure we have 16 items.

const roles = ['Architect', 'Designer', 'Intern', 'Director'];

for (let i = 1; i <= 16; i++) {
    const id = i.toString().padStart(3, '0');
    const data = {
        id: i,
        nameEn: `Member ${id}`,
        nameKr: `멤버 ${id}`,
        role: roles[i % roles.length],
        image: '/team_group.webp', // Placeholder image
        order: i
    };

    fs.writeFileSync(path.join(peopleDir, `person-${id}.json`), JSON.stringify(data, null, 2));
}

console.log('People data generated.');

const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, '../src/content/projects');

if (!fs.existsSync(projectsDir)) {
    console.error(`Directory not found: ${projectsDir}`);
    process.exit(1);
}

const files = fs.readdirSync(projectsDir).filter(file => file.endsWith('.json'));

let updatedCount = 0;

console.log(`Scanning ${files.length} project files...`);

files.forEach(file => {
    const filePath = path.join(projectsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    try {
        const json = JSON.parse(content);
        let modified = false;

        if (json.blocks && Array.isArray(json.blocks)) {
            // Check scale
            const maxW = Math.max(...json.blocks.map(b => b.layout.w));

            let scale = 1;
            if (maxW <= 12) scale = 4;
            else if (maxW <= 24) scale = 2;

            if (scale > 1) {
                console.log(`Migrating ${file}: Scaling by ${scale}x (MaxW: ${maxW} -> ${maxW * scale})`);

                json.blocks = json.blocks.map(b => ({
                    ...b,
                    layout: {
                        ...b.layout,
                        w: b.layout.w * scale,
                        x: b.layout.x * scale
                    }
                }));
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
            updatedCount++;
        }
    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
});

console.log(`Migration complete. Updated ${updatedCount} files.`);

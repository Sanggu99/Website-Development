
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Use relative path from project root
const directory = path.join(process.cwd(), 'public/projects/jeju_healing');
const files = ['img13.jpg', 'img14.jpg', 'img15.jpg', 'img16.jpg'];

async function convert() {
    console.log(`Working directory: ${directory}`);

    for (const file of files) {
        const inputPath = path.join(directory, file);
        const outputPath = path.join(directory, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

        if (fs.existsSync(inputPath)) {
            try {
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                console.log(`✅ Converted: ${file} -> ${path.basename(outputPath)}`);
            } catch (err) {
                console.error(`❌ Error processing ${file}:`, err);
            }
        } else {
            console.warn(`⚠️ File not found: ${file}`);
        }
    }
}

convert();

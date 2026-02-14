import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, 'public');

async function convertDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await convertDir(fullPath);
        } else if (entry.isFile() && /\.(png|jpg|jpeg|JPG|JPEG)$/.test(entry.name)) {
            const ext = path.extname(entry.name);
            const nameWithoutExt = path.basename(entry.name, ext);
            const targetPath = path.join(dir, `${nameWithoutExt}.webp`);

            console.log(`Converting: ${entry.name} -> ${nameWithoutExt}.webp`);

            try {
                await sharp(fullPath)
                    .resize({ width: 2560, withoutEnlargement: true }) // Limit width to 2560px
                    .webp({ quality: 80 }) // 80 is a good balance
                    .toFile(targetPath);

                // Delete original file to save space in dist
                fs.unlinkSync(fullPath);
                console.log(`  Success and deleted original.`);
            } catch (err) {
                console.error(`  Error converting ${entry.name}:`, err);
            }
        }
    }
}

console.log('Starting image conversion to WebP...');
convertDir(baseDir).then(() => {
    console.log('Done!');
}).catch(err => {
    console.error('Fatal error:', err);
});

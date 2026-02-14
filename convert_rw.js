import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'public/recent works');

async function convert() {
    if (!fs.existsSync(targetDir)) {
        console.error('Directory not found:', targetDir);
        return;
    }

    const files = fs.readdirSync(targetDir);
    for (const file of files) {
        if (/\.(png|jpg|jpeg)$/i.test(file)) {
            const ext = path.extname(file);
            const name = path.basename(file, ext);
            const inputPath = path.join(targetDir, file);
            const outputPath = path.join(targetDir, `${name}.webp`);

            console.log(`Converting ${file} to ${name}.webp`);

            try {
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                fs.unlinkSync(inputPath);
                console.log(`Converted and deleted original: ${file}`);
            } catch (err) {
                console.error(`Error converting ${file}:`, err);
            }
        }
    }
}

convert();

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories
const rootRecentWorks = path.join(__dirname, 'recent works');
const publicDir = path.join(__dirname, 'public');
const targetDir = path.join(publicDir, 'recent works');

async function main() {
    console.log('Script started...');

    // 1. Check if folder exists
    if (!fs.existsSync(targetDir)) {
        console.error(`Target directory not found: ${targetDir}`);
        // If files are still in root for some reason
        if (fs.existsSync(rootRecentWorks)) {
            console.log(`Found 'recent works' in root, but expected it in public. Please move manually or re-run previous logic.`);
        }
        return;
    }

    console.log(`Found target directory: ${targetDir}`);
    const files = fs.readdirSync(targetDir);
    console.log(`Found ${files.length} files.`);

    for (const file of files) {
        if (/\.(png|jpg|jpeg)$/i.test(file)) {
            const ext = path.extname(file);
            const name = path.basename(file, ext);
            const inputPath = path.join(targetDir, file);
            const outputPath = path.join(targetDir, `${name}.webp`);

            // Check file size
            const stats = fs.statSync(inputPath);
            const sizeMB = stats.size / (1024 * 1024);
            console.log(`Processing ${file} (${sizeMB.toFixed(2)} MB)... This may take a moment.`);

            try {
                // Resize to max 1920px width to handle huge files
                await sharp(inputPath)
                    .resize({ width: 1920, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                // Verify output exists before deleting input
                if (fs.existsSync(outputPath)) {
                    // fs.unlinkSync(inputPath); // DON'T DELETE YET in case of errors, let user verify
                    console.log(`✅ Converted: ${name}.webp`);

                    // Delete original to save space?
                    try {
                        fs.unlinkSync(inputPath);
                        console.log(`  Deleted original: ${file}`);
                    } catch (e) {
                        console.error(`  Failed to delete original: ${e.message}`);
                    }
                } else {
                    console.error(`❌ Output file not found: ${outputPath}`);
                }
            } catch (err) {
                console.error(`❌ Error converting ${file}:`, err);
            }
        } else {
            console.log(`Skipping non-image file: ${file}`);
        }
    }
    console.log('All done!');
}

main().catch(err => {
    console.error('Fatal error in main loop:', err);
});

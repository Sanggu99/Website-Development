import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Hardcoded absolute path to ensure no ambiguity
// Using raw string to handle backslashes correctly
const targetDir = String.raw`c:\Users\SEOP\Desktop\seop_website\public\recent works`;

async function main() {
    console.log('Script started v2...');
    console.log(`Target Directory: ${targetDir}`);

    if (!fs.existsSync(targetDir)) {
        console.error('ERROR: Directory does not exist!');
        return;
    }

    const files = fs.readdirSync(targetDir);
    console.log(`Found ${files.length} files in directory.`);

    for (const file of files) {
        if (/\.(png|jpg|jpeg)$/i.test(file)) {
            const ext = path.extname(file);
            const name = path.basename(file, ext);
            const inputPath = path.join(targetDir, file);
            const outputPath = path.join(targetDir, `${name}.webp`);

            console.log(`Processing: ${file}`);

            try {
                // Resize to 1920px width, keep aspect ratio
                // Set limitInputPixels to false to handle very large images
                await sharp(inputPath, { limitInputPixels: false })
                    .resize({ width: 1920, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                console.log(`✅ Converted to: ${name}.webp`);

                // Verify and delete
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(inputPath);
                    console.log(`🗑️ Deleted original: ${file}`);
                }
            } catch (err) {
                console.error(`❌ Error converting ${file}:`, err);
            }
        }
    }
    console.log('All operations completed.');
}

main().catch(err => console.error('Fatal Error:', err));

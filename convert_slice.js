import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Hardcoded absolute path
const targetDir = String.raw`c:\Users\SEOP\Desktop\seop_website\public\recent works`;
// Files we expect to process
const targetFiles = ['recent works1.png', 'recent works3.png'];

async function main() {
    console.log('Script started: Auto-Slice Conversion');
    if (!fs.existsSync(targetDir)) {
        console.error('Target directory not found.');
        return;
    }

    // Process all png/jpg in directory
    const files = fs.readdirSync(targetDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

    for (const file of files) {
        const ext = path.extname(file);
        const name = path.basename(file, ext); // e.g., "recent works1"
        const inputPath = path.join(targetDir, file);

        console.log(`\nAnalyzing: ${file}`);

        try {
            const image = sharp(inputPath, { limitInputPixels: false });
            const metadata = await image.metadata();

            // Resize to standard width
            const TARGET_WIDTH = 1920;
            const resizeRatio = TARGET_WIDTH / metadata.width;
            const projectedHeight = Math.round(metadata.height * resizeRatio);

            console.log(`Original: ${metadata.width}x${metadata.height} -> Projected: ${TARGET_WIDTH}x${projectedHeight}`);

            // WebP Limit: 16383px. We use 15000px as safe chunk limit.
            const MAX_CHUNK_HEIGHT_PX = 15000;

            if (projectedHeight > MAX_CHUNK_HEIGHT_PX) {
                console.log(`⚠️ Image is too tall for a single WebP file. Splitting into chunks...`);

                // Calculate height of chunk in ORIGINAL image coordinates
                const chunkHeightOriginal = Math.floor(MAX_CHUNK_HEIGHT_PX / resizeRatio);
                const totalChunks = Math.ceil(metadata.height / chunkHeightOriginal);

                console.log(`Creating ${totalChunks} parts...`);

                for (let i = 0; i < totalChunks; i++) {
                    const top = i * chunkHeightOriginal;
                    const height = Math.min(chunkHeightOriginal, metadata.height - top);

                    const partName = `${name}_part${i + 1}.webp`;
                    const partPath = path.join(targetDir, partName);

                    console.log(`  Processing Part ${i + 1}/${totalChunks} -> ${partName}`);

                    await image
                        .clone()
                        .extract({ left: 0, top: top, width: metadata.width, height: height })
                        .resize({ width: TARGET_WIDTH }) // Resize AFTER extract to keep quality/ratio
                        .webp({ quality: 80 })
                        .toFile(partPath);
                }

                console.log(`✅ Splitting complete for ${file}`);
                fs.unlinkSync(inputPath);
                console.log(`🗑️ Deleted original ${file}`);

            } else {
                console.log(`✅ Image fits in one file. Converting normally...`);
                const outputName = `${name}.webp`;
                const outputPath = path.join(targetDir, outputName);

                await image
                    .resize({ width: TARGET_WIDTH })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                // Verify before delete
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(inputPath);
                    console.log(`🗑️ Deleted original ${file}`);
                }
            }

        } catch (err) {
            console.error(`❌ Error processing ${file}:`, err);
        }
    }
    console.log('\nAll operations completed.');
}

main().catch(err => console.error(err));

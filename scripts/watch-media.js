import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const watchDir = path.join(rootDir, 'public', 'projects');

// Supported formats to convert
const EXTS = ['.jpg', '.jpeg', '.png', '.avif', '.tiff'];

console.log(`🚀 Media Watcher started. Watching: ${watchDir}`);

const watcher = chokidar.watch(watchDir, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: false
});

async function convertToWebp(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!EXTS.includes(ext)) return;

    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, ext);
    const outputPath = path.join(dir, `${baseName}.webp`);

    // Check if webp already exists (to avoid infinite loops)
    if (fs.existsSync(outputPath)) {
        // If the original is newer, we might want to re-convert, but for now let's just skip
        // or check if size is drastically different.
        // Actually, if we delete the original after conversion, this won't be an issue.
    }

    try {
        console.log(`📸 Converting: ${path.basename(filePath)} -> ${baseName}.webp`);
        await sharp(filePath)
            .webp({ quality: 85 })
            .toFile(outputPath);

        // Remove original file after successful conversion
        fs.unlinkSync(filePath);
        console.log(`✅ Success! Original removed.`);
    } catch (err) {
        console.error(`❌ Error converting ${filePath}:`, err);
    }
}

watcher.on('add', filePath => {
    convertToWebp(filePath);
});

// Also watch for changes if someone overwrites a file
watcher.on('change', filePath => {
    convertToWebp(filePath);
});

import fs from 'fs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx';

async function createBilingualWordDocument() {
    console.log('Reading bilingual markdown files...');

    // Read the bilingual website content
    const websiteContent = fs.readFileSync('website_content_bilingual.md', 'utf-8');
    const projectsContent = fs.readFileSync('projects_content.md', 'utf-8');

    // Combine the content
    const combinedContent = websiteContent + '\n\n' + projectsContent;

    console.log('Converting to Word document...');

    // Parse markdown and create Word document
    const doc = new Document({
        sections: [{
            properties: {},
            children: parseMarkdownToDocx(combinedContent)
        }]
    });

    // Generate Word file
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync('SEOP_웹사이트_한영병기.docx', buffer);

    console.log('Successfully created SEOP_웹사이트_한영병기.docx');
}

function parseMarkdownToDocx(markdown) {
    const lines = markdown.split('\n');
    const paragraphs = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip empty lines
        if (line.trim() === '') {
            paragraphs.push(new Paragraph({ text: '' }));
            continue;
        }

        // H1 Heading
        if (line.startsWith('# ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.replace('# ', ''),
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 }
                })
            );
        }
        // H2 Heading
        else if (line.startsWith('## ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.replace('## ', ''),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                })
            );
        }
        // H3 Heading
        else if (line.startsWith('### ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.replace('### ', ''),
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                })
            );
        }
        // H4 Heading
        else if (line.startsWith('#### ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.replace('#### ', ''),
                    heading: HeadingLevel.HEADING_4,
                    spacing: { before: 150, after: 100 }
                })
            );
        }
        // Horizontal rule
        else if (line.trim() === '---') {
            paragraphs.push(
                new Paragraph({
                    text: '─────────────────────────────────────────────',
                    spacing: { before: 200, after: 200 }
                })
            );
        }
        // Bullet list
        else if (line.startsWith('- ')) {
            paragraphs.push(
                new Paragraph({
                    text: line.replace('- ', ''),
                    bullet: { level: 0 }
                })
            );
        }
        // Bold text (simplified)
        else if (line.includes('**')) {
            const parts = line.split('**');
            const runs = [];

            for (let j = 0; j < parts.length; j++) {
                if (j % 2 === 1) {
                    runs.push(new TextRun({ text: parts[j], bold: true }));
                } else {
                    runs.push(new TextRun({ text: parts[j] }));
                }
            }

            paragraphs.push(
                new Paragraph({
                    children: runs
                })
            );
        }
        // Regular text
        else {
            paragraphs.push(
                new Paragraph({
                    text: line
                })
            );
        }
    }

    return paragraphs;
}

createBilingualWordDocument().catch(console.error);

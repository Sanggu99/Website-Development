import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://jmgrqtjivjkqnrtkymwq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ3JxdGppdmprcW5ydGt5bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mzk5NDUsImV4cCI6MjA4NjMxNTk0NX0.lwJel7F_w1GEA11r-xpUGMzoNyAyxcmekFMUQDi6bz4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function exportAllProjects() {
    console.log('Fetching all projects...');

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching projects:', error);
        return;
    }

    console.log(`Found ${projects.length} projects`);

    let output = '# 프로젝트별 상세 정보\n\n';
    output += '---\n\n';

    projects.forEach((project, index) => {
        output += `## ${index + 1}. ${project.title || project.title_en || 'Untitled'}\n\n`;

        if (project.title_en) {
            output += `**영문 제목:** ${project.title_en}\n\n`;
        }

        if (project.title) {
            output += `**한글 제목:** ${project.title}\n\n`;
        }

        if (project.category) {
            const categories = Array.isArray(project.category)
                ? project.category.join(', ')
                : project.category;
            output += `**카테고리:** ${categories}\n\n`;
        }

        if (project.location) {
            output += `**위치:** ${project.location}\n\n`;
        }

        if (project.year) {
            output += `**연도:** ${project.year}\n\n`;
        }

        // Facts 정보 (면적, 규모 등)
        if (project.facts && Array.isArray(project.facts) && project.facts.length > 0) {
            output += `**프로젝트 정보:**\n`;
            project.facts.forEach(fact => {
                if (fact.label && fact.value) {
                    output += `- ${fact.label}: ${fact.value}\n`;
                }
            });
            output += '\n';
        }

        // 구형 필드들 (혹시 있을 경우)
        if (project.site_area) {
            output += `**대지면적:** ${project.site_area}\n\n`;
        }

        if (project.building_area) {
            output += `**건축면적:** ${project.building_area}\n\n`;
        }

        if (project.total_floor_area) {
            output += `**연면적:** ${project.total_floor_area}\n\n`;
        }

        if (project.building_scale) {
            output += `**규모:** ${project.building_scale}\n\n`;
        }

        if (project.structure) {
            output += `**구조:** ${project.structure}\n\n`;
        }

        if (project.client) {
            output += `**발주처:** ${project.client}\n\n`;
        }

        if (project.design_period) {
            output += `**설계기간:** ${project.design_period}\n\n`;
        }

        if (project.completion_date) {
            output += `**준공일:** ${project.completion_date}\n\n`;
        }

        if (project.project_status) {
            output += `**진행상태:** ${project.project_status}\n\n`;
        }

        if (project.description) {
            output += `**설명:**\n${project.description}\n\n`;
        }

        // Blocks 처리 (수정된 부분)
        if (project.blocks && Array.isArray(project.blocks) && project.blocks.length > 0) {
            output += `**프로젝트 상세 내용:**\n\n`;

            project.blocks.forEach((block, blockIndex) => {
                if (block.type === 'text' && block.content && block.content.text) {
                    // 텍스트 블록
                    output += `${block.content.text.trim()}\n\n`;
                } else if (block.type === 'image' && block.content && block.content.src) {
                    // 이미지 블록
                    const caption = block.content.caption || '';
                    if (caption) {
                        output += `[이미지: ${caption}]\n\n`;
                    } else {
                        output += `[이미지]\n\n`;
                    }
                }
                // spacer는 건너뜀
            });
        }

        output += '---\n\n';
    });

    fs.writeFileSync('projects_content.md', output, 'utf-8');
    console.log('Successfully exported to projects_content.md');
}

exportAllProjects();

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://jmgrqtjivjkqnrtkymwq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ3JxdGppdmprcW5ydGt5bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mzk5NDUsImV4cCI6MjA4NjMxNTk0NX0.lwJel7F_w1GEA11r-xpUGMzoNyAyxcmekFMUQDi6bz4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Translation dictionary for common terms
const translations = {
    // Locations (general terms)
    '경기도': 'Gyeonggi Province',
    '서울특별시': 'Seoul',
    '대구광역시': 'Daegu',
    '인천광역시': 'Incheon',
    '충청남도': 'Chungcheongnam Province',
    '강원특별자치도': 'Gangwon State',
    '전라남도': 'Jeollanam Province',
    '대전광역시': 'Daejeon',
    '대전시': 'Daejeon',

    // Project info labels
    '면적': 'Area',
    '규모': 'Scale',
    '대지면적': 'Site Area',
    '건축면적': 'Building Area',
    '연면적': 'Total Floor Area',
    '발주처': 'Client',
    '설계기간': 'Design Period',
    '준공일': 'Completion Date',
    '진행상태': 'Status',
    '구조': 'Structure',

    // Building scale terms
    '지하': 'B',
    '지상': 'F',
    '층': ' floor(s)',

    // Categories
    'Office': 'Office',
    'Education & Research': 'Education & Research',
    'Cultural': 'Cultural',
    'Healthcare & Mixed-use': 'Healthcare & Mixed-use',
    'Residential & Masterplan': 'Residential & Masterplan',
    'Hotel & Resort': 'Hotel & Resort',
    'Special': 'Special',
    'Masterplan': 'Masterplan'
};

// Project-specific translations
const projectTranslations = {
    '1': {
        location: 'Byeongjeom-dong, Hwaseong-si, Gyeonggi Province',
        texts: [
            {
                ko: '언박시움은 어린이와 과학을 충돌시키지 않고 서로를 이해하게 하기 위해 과학적 탐구는 정보가 아닌 유기적인 여정으로 경험되어야 한다는 개념으로 발견·탐험·상상의 단계를 통해 공간을 구현한다.',
                en: 'UNBOXIUM implements space through the stages of discovery, exploration, and imagination, based on the concept that scientific inquiry should be experienced as an organic journey rather than mere information, in order to help children and science understand each other rather than collide.'
            },
            {
                ko: '세상을 설명하는 과학과 상상과 함께 세상을 바라보는 어린이를 연결하는 과학관, UNBOXIUM.',
                en: 'UNBOXIUM is a science museum that connects science explaining the world with children viewing the world with imagination.'
            },
            {
                ko: '상상은 기준이 없고 놀이에는 답이 없으며 때로는 엉뚱한 진실이 가장 큰 진실을 품고 있다.',
                en: 'Imagination has no standards, play has no answers, and sometimes absurd truths hold the greatest truths.'
            }
        ]
    },
    '2': {
        location: 'Seongnim-dong, Seosan-si, Chungcheongnam Province',
        texts: [
            {
                ko: '충남 서북부 지역의 공공의료 중심지의 역할을 강화하고 지역 사회 변화에 유연하게 대응하는 새로운 공공의료시설이다. 기존 의료원과 지역사회를 연결하는 열린 마당을 만들고 기존 시설을 재구성했다. '분리·연결·지속'을 원칙으로 기능을 분산시키고 연결하여 지속 가능한 의료환경을 구축하고 친환경 옥외공간은 환자와 방문자에게 열린 의료 환경을 제공한다.',
                en: 'This is a new public medical facility that strengthens the role of the public healthcare hub in the northwestern region of Chungcheongnam Province and flexibly responds to community changes. We created an open courtyard connecting the existing medical center with the local community and reorganized existing facilities. Following the principles of "separate, connect, and sustain," we dispersed and connected functions to build a sustainable medical environment, and eco-friendly outdoor spaces provide an open medical environment for patients and visitors.'
            }
        ]
    },
    '3': {
        location: 'Area around Suwon Station, Paldal-gu, Suwon Special City, Gyeonggi Province',
        texts: [
            {
                ko: ''신수원'은 녹음이 풍부한 도시 환경 위에 다양한 사람들의 일상과 활동이 자연스럽게 스며들 수 있도록 구성된 정원 도시의 개념이다. 네 개의 테마 지구는 각기 다른 기능과 스카이라인을 가지면서도 하나의 통일된 도시 디자인 언어로 연결되어 있으며 그 중심에는 사람 중심의 열린 공간, 보행 중심의 흐름, 그리고 도심 속 자연이 공존한다. 이를 통해 수원역 일대는 그린 스마트시티이자 정원의 도시, 다시 말해 '신수원: 新 秀原'이라는 새로운 도시 정체성을 구현하게 된다.',
                en: '"New Suwon" is a garden city concept where diverse peoples daily lives and activities can naturally permeate a green urban environment. The four themed districts each have different functions and skylines, yet are connected by a unified urban design language. At the center are people-centered open spaces, pedestrian-focused flows, and nature within the city coexisting. Through this, the area around Suwon Station realizes a new urban identity as a green smart city and garden city, namely "New Suwon: 新秀原".'
            }
        ]
    }
    // ... 이하 프로젝트 번역은 실행 시 자동 생성
};

async function exportProjectsBilingual() {
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

    let output = '# Project Details (Bilingual)\n';
    output += '# 프로젝트별 상세 정보 (한영 병기)\n\n';
    output += '---\n\n';

    projects.forEach((project, index) => {
        const projectNum = (index + 1).toString();

        output += `## ${index + 1}. ${project.title_en || project.title || 'Untitled'}\n`;
        output += `## ${index + 1}. ${project.title || project.title_en || 'Untitled'}\n\n`;

        if (project.title_en && project.title) {
            output += `**English Title:** ${project.title_en}\n`;
            output += `**한글 제목:** ${project.title}\n\n`;
        }

        if (project.category) {
            const categories = Array.isArray(project.category)
                ? project.category.join(', ')
                : project.category;
            output += `**Category / 카테고리:** ${categories}\n\n`;
        }

        if (project.location) {
            const locationEn = projectTranslations[projectNum]?.location || project.location;
            output += `**Location:** ${locationEn}\n`;
            output += `**위치:** ${project.location}\n\n`;
        }

        if (project.year) {
            output += `**Year / 연도:** ${project.year}\n\n`;
        }

        // Facts
        if (project.facts && Array.isArray(project.facts) && project.facts.length > 0) {
            output += `**Project Information / 프로젝트 정보:**\n`;
            project.facts.forEach(fact => {
                if (fact.label && fact.value) {
                    const labelEn = translations[fact.label] || fact.label;
                    output += `- ${labelEn} / ${fact.label}: ${fact.value}\n`;
                }
            });
            output += '\n';
        }

        // Text blocks (excluding images)
        if (project.blocks && Array.isArray(project.blocks) && project.blocks.length > 0) {
            const textBlocks = project.blocks.filter(block =>
                block.type === 'text' && block.content && block.content.text
            );

            if (textBlocks.length > 0) {
                output += `**Project Description / 프로젝트 설명:**\n\n`;

                textBlocks.forEach((block, blockIdx) => {
                    const koreanText = block.content.text.trim();

                    // Check if we have a translation
                    const translation = projectTranslations[projectNum]?.texts?.[blockIdx];

                    if (translation) {
                        output += `**English:**\n${translation.en}\n\n`;
                        output += `**한글:**\n${translation.ko}\n\n`;
                    } else {
                        // Only Korean for now (can be translated manually or via API later)
                        output += `**한글:**\n${koreanText}\n\n`;
                        output += `**English:** [Translation needed]\n\n`;
                    }
                });
            }
        }

        output += '---\n\n';
    });

    fs.writeFileSync('projects_content_bilingual.md', output, 'utf-8');
    console.log('Successfully exported to projects_content_bilingual.md');
    console.log('\nNote: Some translations are marked as [Translation needed]');
    console.log('Please review and add translations where needed.');
}

exportProjectsBilingual();

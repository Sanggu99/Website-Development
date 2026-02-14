
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmgrqtjivjkqnrtkymwq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ3JxdGppdmprcW5ydGt5bXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3Mzk5NDUsImV4cCI6MjA4NjMxNTk0NX0.lwJel7F_w1GEA11r-xpUGMzoNyAyxcmekFMUQDi6bz4';

const supabase = createClient(supabaseUrl, supabaseKey);

const wonikData = {
    "id": 1,
    "title": "원익 홀딩스 강남 사옥",
    "title_en": "Wonik Holdings Gangnam Office",
    "location": "강남",
    "year": "2025",
    "hero_image": "/projects/generated-image-february-03-2026-11_17am.jpeg",
    "category": ["Office"],
    "description": [],
    "gallery_images": [
        {
            "fullWidth": false,
            "src": "/projects/generated-image-february-03-2026-11_00am.jpeg",
            "caption": "원익홀딩스 투시도"
        }
    ]
    // Removed layout
};

const gaebongData = {
    "id": 19,
    "title": "개봉동 사회복지관",
    "title_en": "Gaebong Social Welfare Center",
    "location": "대한민국",
    "year": "2024",
    "hero_image": "/projects/gaebong/img1.webp",
    "description": [
        "개봉동 사회복지관은 도시의 낡은 직조 사이로 새로운 사회적 안전망을 짜 넣는 작업입니다.",
        "고령 인구와 청소년이 공존하는 지역적 특성을 고려하여, 서로 다른 세대가 자연스럽게 마주칠 수 있는 층별 보이드와 공용 테라스를 설계의 핵심으로 삼았습니다.",
        "따뜻한 톤의 노출 콘크리트와 조절된 채광은 공간 전체에 평온함을 부여하며, 지역 사회를 위한 열린 건축의 표본이 됩니다."
    ],
    "facts": [
        {
            "label": "위치",
            "value": "서울시 구로구"
        },
        {
            "label": "면적",
            "value": "2,450.00m²"
        },
        {
            "label": "규모",
            "value": "지하1층, 지상4층"
        }
    ],
    "gallery_images": [
        {
            "src": "/projects/gaebong/img1.webp",
            "fullWidth": false,
            "caption": "도시의 콘텍스트와 조화를 이루는 주 진입부 전경입니다. 수평적인 선의 흐름을 강조하여 주변 건물들과의 시각적 연속성을 유지했습니다."
        },
        {
            "src": "/projects/gaebong/img2.webp",
            "fullWidth": false,
            "caption": "수직적 보이드가 만들어내는 풍부한 공간감을 통해 서로 다른 층에서 활동하는 사용자들이 시각적으로 연결되도록 설계했습니다."
        },
        {
            "src": "/projects/gaebong/img3.webp",
            "fullWidth": false,
            "caption": "시간에 따라 변화하는 빛의 변주를 내부로 끌어들여, 공간이 매 순간 다른 표정을 가질 수 있도록 의도했습니다."
        },
        {
            "src": "/projects/gaebong/img4.webp",
            "fullWidth": false,
            "caption": "사회적 소통이 일어나는 열린 테라스는 지역 주민들이 언제든 머무를 수 있는 도심 속 작은 쉼터가 됩니다."
        },
        {
            "src": "/projects/gaebong/img5.webp",
            "fullWidth": false,
            "caption": "따뜻한 질감의 재료와 세밀한 디테일은 방문객들에게 심리적 안정을 주며 공간에 대한 애착을 형성하게 합니다."
        },
        {
            "src": "/projects/gaebong/img6.webp",
            "fullWidth": false
        },
        {
            "src": "/projects/gaebong/img7.webp",
            "fullWidth": false
        }
    ],
    "category": ["Cultural"]
    // Removed layout
};

async function fixProjects() {
    console.log('Restoring Wonik Holdings to ID 1...');
    // Upsert ID 1 (Overwrite Gaebong at 1 with Wonik)
    const { error: error1 } = await supabase
        .from('projects')
        .upsert(wonikData);

    if (error1) console.error('Error restoring Wonik:', error1);
    else console.log('Wonik restored to ID 1.');

    console.log('Adding Gaebong Social Welfare Center as ID 19...');
    // Upsert ID 19
    const { error: error19 } = await supabase
        .from('projects')
        .upsert(gaebongData);

    if (error19) console.error('Error adding Gaebong:', error19);
    else console.log('Gaebong added as ID 19.');
}

fixProjects();

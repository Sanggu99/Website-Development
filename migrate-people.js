const fs = require('fs');
const path = require('path');

const team = [
    { nameEn: 'SEOP SANG GU', nameKr: '섭상구', role: 'Principal / Architect', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop', order: 1 },
    { nameEn: 'KIM MIN SUNG', nameKr: '김민성', role: 'Partner / Architect', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop', order: 2 },
    { nameEn: 'LEE JIN HYUK', nameKr: '이진혁', role: 'Senior Architect', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop', order: 3 },
    { nameEn: 'PARK MIN SUNG', nameKr: '박민성', role: 'Architect / 소장', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop', order: 4 },
    { nameEn: 'CHOI WOO JIN', nameKr: '최우진', role: 'Senior Designer', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=2048&auto=format&fit=crop', order: 5 },
    { nameEn: 'JUNG DA EUN', nameKr: '정다은', role: 'Architect', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop', order: 6 },
    { nameEn: 'HAN SUNG MIN', nameKr: '한성민', role: 'Architect', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop', order: 7 },
    { nameEn: 'SONG JI HYUN', nameKr: '송지현', role: 'Designer', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop', order: 8 },
    { nameEn: 'KIM DO YOON', nameKr: '김도윤', role: 'Architectural Designer', image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=1974&auto=format&fit=crop', order: 9 },
    { nameEn: 'PARK SEO JUN', nameKr: '박서준', role: 'Intern', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=2070&auto=format&fit=crop', order: 10 },
    { nameEn: 'YOO JAE SUK', nameKr: '유재석', role: 'BIM Specialist', image: 'https://images.unsplash.com/photo-1542343633-ce3256f2183e?q=80&w=1974&auto=format&fit=crop', order: 11 },
    { nameEn: 'KANG HO DONG', nameKr: '강호동', role: 'Exhibition Designer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop', order: 12 },
    { nameEn: 'SHIN DONG YUP', nameKr: '신동엽', role: 'Technical Lead', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1974&auto=format&fit=crop', order: 13 },
    { nameEn: 'HA JI WON', nameKr: '하지원', role: 'Office Manager', image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1972&auto=format&fit=crop', order: 14 },
    { nameEn: 'LEE BYUNG HUN', nameKr: '이병헌', role: 'Graphic Designer', image: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=1974&auto=format&fit=crop', order: 15 },
    { nameEn: 'KIM HYE SOO', nameKr: '김혜수', role: 'Landscape Architect', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop', order: 16 },
];

const targetDir = path.join(__dirname, 'src', 'content', 'people');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

team.forEach(person => {
    const fileName = `${person.nameEn.toLowerCase().replace(/\s+/g, '-')}.json`;
    fs.writeFileSync(path.join(targetDir, fileName), JSON.stringify(person, null, 2));
    console.log(`Migrated ${person.nameEn}`);
});

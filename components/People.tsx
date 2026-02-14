import React, { useState, useEffect } from 'react';
import { contentService, Person } from '../src/services/contentService';

interface PeopleProps {
    setHeaderTheme?: (theme: 'light' | 'dark' | undefined) => void;
}

const People: React.FC<PeopleProps> = ({ setHeaderTheme }) => {
    const heroRef = React.useRef<HTMLDivElement>(null);
    const [team, setTeam] = useState<Person[]>(contentService.getPeople());

    useEffect(() => {
        const handleUpdate = () => setTeam(contentService.getPeople());
        window.addEventListener('seop_people_updated', handleUpdate);
        return () => window.removeEventListener('seop_people_updated', handleUpdate);
    }, []);

    // Use team state for rendering
    // const team is already defined via useState above


    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Check if more than 50% of the hero section is visible
                // If > 50% visible -> Dark Theme (White Text)
                // If <= 50% visible -> Light Theme (Navy Text)
                if (setHeaderTheme) {
                    setHeaderTheme(entry.intersectionRatio > 0.5 ? 'dark' : 'light');
                }
            },
            {
                root: null,
                threshold: 0.5, // Trigger when visibility crosses 50%
            }
        );

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        return () => {
            if (heroRef.current) {
                observer.unobserve(heroRef.current);
            }
            // Reset on unmount
            if (setHeaderTheme) setHeaderTheme(undefined);
        };
    }, [setHeaderTheme]);

    return (
        <section id="people" className="bg-white">
            {/* Group Photo Section: Full Screen with Text Overlay */}
            <div ref={heroRef} className="relative w-full h-screen overflow-hidden group">
                <img
                    src="/team_group.webp"
                    alt="SEOP Team Group"
                    className="w-full h-full object-cover grayscale brightness-[0.7]"
                />

                {/* Text Overlay matching reference 3945 - Updated weights */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-6">
                    <h1 className="text-7xl md:text-[120px] lg:text-[180px] font-poppins font-medium tracking-tight mb-4 leading-none">
                        PEOPLE
                    </h1>
                    <p className="text-xl md:text-[32px] lg:text-[42px] font-poppins font-light tracking-tight">
                        Designing with Insight, Building with Purpose.
                    </p>
                </div>
            </div>

            {/* Organization Section: Moved from Service Page */}
            <section id="people-organization" className="h-screen w-full bg-white flex flex-col relative overflow-hidden">
                <div className="w-full flex flex-col md:flex-row items-stretch mt-[120px] mb-16">
                    <div className="md:w-1/2 px-6 md:px-14 lg:px-24 flex flex-col justify-center">
                        <div className="max-w-xl mx-auto w-full">
                            <div className="w-[300%]">
                                <h2 className="text-4xl md:text-5xl lg:text-[72px] font-poppins font-medium text-[#232A53] mb-8 tracking-[-0.03em] leading-none uppercase">ORGANIZATION</h2>
                                <p className="text-sm md:text-[18px] text-gray-600 font-light leading-relaxed opacity-90 tracking-[-0.1em]">
                                    에스이오피 건축은 공공, 주거, 민간 개발, 건설사업관리, 친환경 연구 분야를 포괄하는 종합 건설·개발 전문 기업으로 각 부문 간 유기적인 협업을 통해 지속가능한 도시환경을 창출하고 있습니다.<br />
                                    각 부문은 상호 협력하여 건설 및 부동산 개발 분야에서의 경쟁력을 강화하고, 지속가능한 성장을 추구합니다.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2" />
                </div>

                <div className="flex flex-col md:flex-row w-full flex-grow mt-auto items-stretch">
                    {[
                        { en: 'PUBLIC', kr: '공공사업부문', img: '/Organization/공공사업부분.jpg' },
                        { en: 'RESIDENTIAL', kr: '주거사업부문', img: '/Organization/주거사업부문.png' },
                        { en: 'DEVELOPMENT', kr: '민간/개발사업부문', img: '/Organization/민간개발사업부분.jpg' },
                        { en: 'Strategy', kr: '전략기획부문', img: '/Organization/전략기획부문.jpg' },
                        { en: 'ECO-LAB', kr: '친환경연구소', img: '/Organization/친환경연구소.jpg' },
                        { en: 'CM', kr: '건설사업관리부문', img: '/Organization/건설사업관리부문.jpg' }
                    ].map((org, i) => (
                        <div key={i} className="flex-1 relative group cursor-pointer overflow-hidden">
                            <img
                                src={org.img}
                                alt={org.en}
                                className={`absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-1000 group-hover:scale-110 ${i < 2 ? '[object-position:25%_center]' : 'object-center'}`}
                            />
                            <div className="absolute inset-0 bg-[#232A53]/20 transition-colors duration-500 group-hover:bg-[#232A53]/70" />
                            <div className="absolute inset-0 p-10 flex flex-col justify-center items-start text-left text-white z-10 pointer-events-none">
                                <h4 className="text-2xl lg:text-3xl font-poppins font-medium mb-0.5 tracking-normal">{org.en}</h4>
                                <p className="text-[20px] font-medium opacity-90 tracking-[-0.1em]">{org.kr}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Grid of Team Members */}
            <div className="w-full bg-white py-24 px-12 md:px-24 lg:px-48">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] max-w-[1400px] mx-auto">
                    {team.map((person, idx) => (
                        <div key={idx} className="relative aspect-square group overflow-hidden bg-gray-50">
                            {/* Base Image: Black and White */}
                            <img
                                src={person.imageBw}
                                alt={person.nameEn}
                                className="absolute inset-0 w-full h-full object-cover object-top"
                            />

                            {/* Hover Image: Color */}
                            <img
                                src={person.imageColor}
                                alt={person.nameEn}
                                className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                            />

                            {/* Hover Overlay: Info */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 md:p-8">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-white text-xl font-bold uppercase tracking-wider mb-1">
                                        {person.nameEn}
                                    </h3>
                                    <p className="text-white/90 text-sm font-medium mb-4">
                                        {person.nameKr}
                                    </p>
                                    <p className="text-white/70 text-xs font-light tracking-widest uppercase border-t border-white/30 pt-3 inline-block">
                                        {person.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default People;

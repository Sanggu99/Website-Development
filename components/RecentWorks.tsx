import React, { useMemo, useRef, useState, useEffect } from 'react';
import { contentService, RecentWorkData } from '../src/services/contentService';
import { ArrowUpRight } from 'lucide-react';
import RecentWorkRenderer from './RecentWorkRenderer';
import { Block } from '../types';

interface RecentWorksProps {
    onNavigate: (id: string) => void;
}

interface RecentWorkItem {
    id: string;
    titleEn: string;
    titleKr: string;
    category: string;
    contentBlocks: Block[];
    speed: number;
}

const RecentWorks: React.FC<RecentWorksProps> = ({ onNavigate }) => {
    const [works, setWorks] = useState(contentService.getRecentWorks());

    useEffect(() => {
        const handleUpdate = () => setWorks(contentService.getRecentWorks());
        window.addEventListener('seop_recent_works_updated', handleUpdate);
        contentService.fetchRecentWorks();
        return () => window.removeEventListener('seop_recent_works_updated', handleUpdate);
    }, []);

    const columns = useMemo(() => {
        // Map works to columns 1, 2, 3 (taking the first one found for each col for now)
        // If we want multiple items per column, logic would change, but "preview that detail page" implies 1:1 map for the showcase.
        const getWork = (col: number) => works.find(w => w.columnIndex === col);

        return [1, 2, 3].map(colIndex => {
            const work = getWork(colIndex);
            if (work) {
                return {
                    id: work.id.toString(),
                    titleEn: work.titleEn || work.title,
                    titleKr: work.titleKr || '',
                    category: work.category || 'Recent Work',
                    contentBlocks: work.contentBlocks || [],
                    speed: work.scrollSpeed || 1.0
                };
            }
            return null;
        });
    }, [works]);

    return (

        <div className="h-screen w-full flex flex-col md:flex-row bg-white pt-[80px] md:pt-[88px] overflow-hidden gap-3 px-0">
            {columns.map((item, index) => (
                item ? (
                    <Column
                        key={item.id}
                        item={item as RecentWorkItem}
                        index={index + 1}
                        onClick={() => onNavigate(item.id)}
                    />
                ) : (
                    <div key={`empty-${index}`} className="flex-1 bg-gray-50 flex items-center justify-center text-gray-300 text-sm tracking-widest uppercase">
                        Add Work to Column {index + 1}
                    </div>
                )
            ))}
        </div>
    );
};

const Column: React.FC<{ item: RecentWorkItem; index: number; onClick: () => void }> = ({ item, index, onClick }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const animationRef = useRef<number | null>(null);
    const scrollPosRef = useRef(0);

    // Auto-scroll logic matches previously established functionality...
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollSpeed = item.speed;

        const animate = () => {
            if (!isHovering && container) {
                scrollPosRef.current += scrollSpeed;
                if (scrollPosRef.current >= container.scrollHeight / 2) {
                    scrollPosRef.current = 0;
                }
                container.scrollTop = scrollPosRef.current;
                animationRef.current = requestAnimationFrame(animate);
            }
        };
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
        };
    }, [isHovering, item.speed]);

    return (
        <div
            className={`flex-1 relative h-full group cursor-pointer overflow-hidden transition-all duration-500`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={onClick}
        >
            {/* Background Content (Actual Layout Renderer) */}
            <div
                ref={scrollContainerRef}
                className="absolute inset-0 w-full h-full overflow-hidden bg-white pointer-events-none"
                style={{ scrollBehavior: 'auto' }}
            >
                <div className="flex flex-col w-full">
                    {/* Render blocks twice for seamless loop */}
                    <div className="w-full relative">
                        <RecentWorkRenderer blocks={item.contentBlocks} />
                    </div>
                    <div className="w-full relative">
                        <RecentWorkRenderer blocks={item.contentBlocks} />
                    </div>
                </div>
            </div>

            {/* Overlay Info - Navy Blur Background on Hover */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-[#232A53]/90 group-hover:backdrop-blur-sm transition-all duration-500 z-10 flex flex-col justify-end p-8 md:p-12 pb-20 md:pb-24 pointer-events-none">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 bg-white text-[#002D57] text-[10px] tracking-widest uppercase font-bold mb-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {item.category}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white leading-tight mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                        {item.titleEn}
                    </h2>
                    <p className="text-sm md:text-base text-gray-300 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                        {item.titleKr}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-white font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 translate-x-[-10px] group-hover:translate-x-0">
                        <span>View Project</span>
                        <ArrowUpRight size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecentWorks;

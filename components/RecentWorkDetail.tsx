
import React, { useEffect, useState, useMemo } from 'react';
import { contentService } from '../src/services/contentService';
import { Block } from '../types';
import { ArrowLeft } from 'lucide-react';
import RecentWorkRenderer from './RecentWorkRenderer';

interface RecentWorkDetailProps {
    id: string;
    onBack: () => void;
}

const RecentWorkDetail: React.FC<RecentWorkDetailProps> = ({ id, onBack }) => {
    const [works, setWorks] = useState(contentService.getRecentWorks());

    useEffect(() => {
        const handleUpdate = () => setWorks(contentService.getRecentWorks());
        window.addEventListener('seop_recent_works_updated', handleUpdate);
        if (works.length === 0) contentService.fetchRecentWorks();
        return () => window.removeEventListener('seop_recent_works_updated', handleUpdate);
    }, []);

    const work = works.find(w => w.id.toString() === id);

    // Responsive Row Height
    const [rowHeight, setRowHeight] = useState(40);
    useEffect(() => {
        const handleResize = () => {
            // 1400px -> 40px base
            const baseWidth = 1400;
            const baseRowHeight = 40;
            const newHeight = (window.innerWidth / baseWidth) * baseRowHeight;
            setRowHeight(Math.max(10, newHeight));
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!work) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    const blocks = work.contentBlocks || [];

    // Layout Processing with Auto-Scaling
    const currentLayouts = useMemo(() => {
        if (!blocks.length) return [];

        // Check if we need to scale up (if max w is small, e.g., <= 12)
        const maxW = Math.max(...blocks.map(b => b.layout.w));
        const shouldScale = maxW <= 12;

        return blocks.map(b => ({
            ...b.layout,
            w: shouldScale ? b.layout.w * 2 : b.layout.w,
            x: shouldScale ? b.layout.x * 2 : b.layout.x,
            static: true
        }));
    }, [blocks]);

    const renderBlock = (block: Block) => {
        const style = {
            fontSize: block.content.fontSize || '14px',
            fontWeight: block.content.fontWeight || '400',
            whiteSpace: 'pre-wrap' as const,
        };

        switch (block.type) {
            case 'heading':
                return (
                    <div className="w-full h-full flex items-center">
                        <h2 className="text-xl md:text-2xl font-bold text-[#002D57] uppercase">{block.content.text}</h2>
                    </div>
                );
            case 'text':
                return (
                    <div className="w-full h-full p-4">
                        <p style={style} className="text-gray-700 leading-relaxed font-sans">
                            {block.content.text}
                        </p>
                    </div>
                );
            case 'image':
                return (
                    <div className="w-full h-full relative group overflow-hidden bg-gray-50">
                        <img
                            src={block.content.src}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="content"
                        />
                        {block.content.caption && (
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                {block.content.caption}
                            </div>
                        )}
                    </div>
                );
            case 'spacer': return <div className="w-full h-full" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-white pt-[80px] md:pt-[100px] animate-in fade-in duration-500">
            {/* Simple Header */}
            <div className="px-6 md:px-12 mb-12">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-[#002D57] transition-colors font-bold mb-6 text-sm"
                >
                    <ArrowLeft size={16} /> Back to Recent Works
                </button>
                <h1 className="text-3xl md:text-5xl font-bold text-[#002D57] mb-4 uppercase">{work.titleEn || work.title}</h1>
                {work.titleKr && <h2 className="text-xl md:text-2xl text-gray-500 font-medium">{work.titleKr}</h2>}
                {work.description && <p className="mt-6 text-gray-600 max-w-2xl leading-relaxed">{work.description}</p>}
            </div>

            {/* Grid Content */}
            {blocks.length > 0 ? (
                <div className="px-6 md:px-12 pb-24 w-full">
                    {/* Pass key based on length to force re-render on data change if needed, but blocks prop should handle it */}
                    <RecentWorkRenderer blocks={blocks} />
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center text-gray-300">
                    No content details available.
                </div>
            )}
        </div>
    );
};

export default RecentWorkDetail;

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { contentService } from '../src/services/contentService';
import { NewsItem } from '../newsData';

const DraggablePopup: React.FC<{ item: NewsItem; index: number; onClose: (id: number) => void }> = ({ item, index, onClose }) => {
    // Initial position: Top Left with cascade
    // Header is usually 80-100px. Let's start at top: 120px, left: 40px
    const [position, setPosition] = useState({ x: 40 + (index * 20), y: 120 + (index * 20) });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const popupRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (popupRef.current && !e.defaultPrevented) {
            setIsDragging(true);
            const rect = popupRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    return (
        <div
            ref={popupRef}
            className="fixed w-[320px] bg-white/80 backdrop-blur-md shadow-2xl rounded-none border border-gray-100 flex flex-col z-[100]"
            style={{
                top: position.y,
                left: position.x,
                cursor: isDragging ? 'grabbing' : 'auto'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="relative h-48 bg-gray-100 overflow-hidden group cursor-grab active:cursor-grabbing">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover pointer-events-none"
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=News')}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 select-none">No Image</div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(item.id); }}
                        className="bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-sm transition-colors cursor-pointer"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow select-none bg-transparent">
                <span className="text-[10px] font-bold text-[#002D57] tracking-widest uppercase mb-2">{item.category}</span>
                <h3
                    className="text-lg font-bold text-[#002D57] leading-tight mb-3 line-clamp-2 hover:underline cursor-pointer"
                    onClick={(e) => { if (!isDragging) window.open(item.externalLink || `#/news/${item.id}`, '_blank'); }}
                >
                    {item.title}
                </h3>
                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-end items-center">
                    <button
                        onClick={(e) => { if (!isDragging) window.open(item.externalLink || `#/news/${item.id}`, '_blank'); }}
                        className="text-xs font-bold text-[#002D57] flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        Read more <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const HomePopups: React.FC = () => {
    const [popups, setPopups] = useState<NewsItem[]>([]);

    useEffect(() => {
        const checkPopups = () => {
            const allNews = contentService.getNews();
            // Robust filter for popup flag
            const activePopups = allNews.filter(n => n.showAsPopup || (n as any).show_as_popup === true);
            if (activePopups.length > 0) {
                setPopups(activePopups);
            }
        };

        checkPopups();
        window.addEventListener('seop_news_updated', checkPopups);
        return () => window.removeEventListener('seop_news_updated', checkPopups);
    }, []);

    const closePopup = (id: number) => {
        setPopups(prev => prev.filter(p => p.id !== id));
    };

    if (popups.length === 0) return null;

    return (
        <>
            {popups.map((item, index) => (
                <DraggablePopup
                    key={item.id}
                    item={{
                        ...item,
                        // Normalize properties for the child component
                        externalLink: item.externalLink || (item as any).external_link,
                        image: item.image || (item as any).image_url
                    }}
                    index={index}
                    onClose={closePopup}
                />
            ))}
        </>
    );
};

export default HomePopups;

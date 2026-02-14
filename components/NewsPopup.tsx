import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { NewsItem, newsData } from '../newsData';

interface NewsPopupProps {
    newsId: number;
    onClose: () => void;
    onNavigate: (id: number) => void;
}

const NewsPopup: React.FC<NewsPopupProps> = ({ newsId, onClose, onNavigate }) => {
    const [position, setPosition] = useState({ x: 40, y: 120 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const popupRef = useRef<HTMLDivElement>(null);

    const newsItem = newsData.find(n => n.id === newsId) || newsData[0];

    const handleMouseDown = (e: React.MouseEvent) => {
        if (popupRef.current) {
            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y
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
            onMouseDown={handleMouseDown}
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
            className={`fixed z-[80] w-72 md:w-80 bg-white/80 shadow-2xl border border-gray-200 rounded-sm overflow-hidden flex flex-col transition-shadow duration-300 ${isDragging ? 'shadow-3xl cursor-grabbing' : 'cursor-default'}`}
        >
            {/* Content */}
            <div className="relative aspect-video group cursor-pointer overflow-hidden" onClick={() => onNavigate(newsItem.id)}>
                <img
                    src={newsItem.image}
                    alt={newsItem.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ExternalLink size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300" />
                </div>
            </div>

            <div className="p-5 flex flex-col gap-2">
                <span className="text-[12px] uppercase tracking-widest text-[#232A53] font-bold leading-none mb-1">{newsItem.category}</span>
                <h3
                    className="text-lg md:text-xl font-poppins font-bold text-[#232A53] leading-tight line-clamp-2 hover:opacity-70 transition-opacity cursor-pointer"
                    onClick={() => onNavigate(newsItem.id)}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {newsItem.title}
                </h3>
                <p className="text-[11px] text-gray-600 line-clamp-3 mt-1 leading-relaxed">
                    {newsItem.summary}
                </p>
                <div className="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
                    <button
                        onClick={() => onNavigate(newsItem.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-[9px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#232A53] transition-colors"
                    >
                        View More
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-[#232A53] transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsPopup;

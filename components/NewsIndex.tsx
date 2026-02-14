import React, { useState, useEffect } from 'react';
import { newsData } from '../newsData';
import { Grid, List } from 'lucide-react';
import { NewsItem } from '../newsData';
import { contentService } from '../src/services/contentService';

interface NewsIndexProps {
    onNavigate: (id: number) => void;
    viewMode: 'checkerboard' | 'list';
}

const NewsIndex: React.FC<NewsIndexProps> = ({ onNavigate, viewMode }) => {
    const [newsItems, setNewsItems] = useState<NewsItem[]>(contentService.getNews());

    // Sync with service updates
    useEffect(() => {
        const handleUpdate = () => setNewsItems(contentService.getNews());
        window.addEventListener('seop_news_updated', handleUpdate);
        return () => window.removeEventListener('seop_news_updated', handleUpdate);
    }, []);

    const handleNewsClick = (item: NewsItem) => {
        if (item.externalLink) {
            window.open(item.externalLink, '_blank');
        } else {
            onNavigate(item.id);
        }
    };

    return (
        <div className="bg-white min-h-screen relative snap-y snap-mandatory">
            <div className="w-full">
                {viewMode === 'checkerboard' ? (
                    <div className="flex flex-col">
                        {newsItems.map((item) => {
                            const layout = item.layoutType || 'left-image';
                            const aspectRatioClass = item.aspectRatio || 'aspect-video';
                            const objectPosition = item.objectPosition || 'center';

                            if (layout === 'left-image') {
                                // Pattern 0: Image (Left) + Text (Right)
                                return (
                                    <div key={item.id} className="snap-start snap-always h-screen pt-[112px] px-6 md:px-24 flex flex-col justify-center border-b border-gray-50/50 last:border-0">
                                        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                                            <div className="w-full md:w-3/4 group overflow-hidden cursor-pointer" onClick={() => handleNewsClick(item)}>
                                                <div className={`w-full overflow-hidden ${aspectRatioClass}`}>
                                                    <img
                                                        src={item.image}
                                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out hover:scale-[1.02]"
                                                        alt={item.title}
                                                        style={{ objectPosition }}
                                                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Error')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full md:w-1/4 pt-4 md:pt-12">
                                                <span className="text-[22px] uppercase tracking-[0.05em] font-medium text-[#232A53] mb-2 block">{item.category}</span>
                                                <h2 className={`text-3xl md:text-[44px] font-bold text-[#232A53] leading-tight mb-6 uppercase tracking-tight hover:opacity-70 transition-opacity cursor-pointer ${item.titleAlignment === 'left' ? 'text-left' : item.titleAlignment === 'center' ? 'text-center' : item.titleAlignment === 'right' ? 'text-right' : 'text-justify'}`} onClick={() => handleNewsClick(item)}>
                                                    {item.title}
                                                </h2>
                                                <p className={`text-gray-600 leading-relaxed mb-8 break-keep text-justify ${item.fontSize || 'text-base'} ${item.fontWeight || 'font-light'}`}>
                                                    {item.summary}
                                                </p>
                                                <div className="flex justify-between items-end w-full">
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{item.date}</span>
                                                    <button onClick={() => handleNewsClick(item)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#232A53] transition-all">Read More</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else if (layout === 'full-width') {
                                // Pattern 1: Full Width Image
                                return (
                                    <div key={item.id} className="snap-start snap-always h-screen pt-[112px] px-6 md:px-24 flex flex-col justify-center border-b border-gray-50/50 last:border-0">
                                        <div className="w-full group overflow-hidden cursor-pointer flex justify-center" onClick={() => handleNewsClick(item)}>
                                            <div className={`w-full overflow-hidden ${aspectRatioClass} max-h-[70vh]`}>
                                                <img
                                                    src={item.image}
                                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out hover:scale-[1.01]"
                                                    alt={item.title}
                                                    style={{ objectPosition }}
                                                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Error')}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-between items-start max-w-4xl mx-auto md:mx-0">
                                            <div className="w-full md:w-2/3">
                                                <span className="text-[22px] uppercase tracking-[0.05em] font-medium text-[#232A53] mb-2 block">{item.category}</span>
                                                <h2 className={`text-3xl md:text-[44px] font-bold text-[#232A53] leading-tight mb-4 uppercase tracking-tight hover:opacity-70 transition-opacity cursor-pointer ${item.titleAlignment === 'left' ? 'text-left' : item.titleAlignment === 'center' ? 'text-center' : item.titleAlignment === 'right' ? 'text-right' : 'text-justify'}`} onClick={() => handleNewsClick(item)}>
                                                    {item.title}
                                                </h2>
                                                <p className={`text-gray-600 leading-relaxed break-keep text-justify ${item.fontSize || 'text-base'} ${item.fontWeight || 'font-light'}`}>
                                                    {item.summary}
                                                </p>
                                                <div className="flex justify-between items-end mt-8 w-full">
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{item.date}</span>
                                                    <button onClick={() => handleNewsClick(item)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#232A53] transition-all">Read More</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                // Pattern 2: Text (Left) + Image (Right)
                                return (
                                    <div key={item.id} className="snap-start snap-always h-screen pt-[112px] px-6 md:px-24 flex flex-col justify-center border-b border-gray-50/50 last:border-0">
                                        <div className="flex flex-col md:flex-row-reverse gap-8 md:gap-16 items-start">
                                            <div className="w-full md:w-3/4 group overflow-hidden cursor-pointer" onClick={() => handleNewsClick(item)}>
                                                <div className={`w-full overflow-hidden ${aspectRatioClass}`}>
                                                    <img
                                                        src={item.image}
                                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out hover:scale-[1.02]"
                                                        alt={item.title}
                                                        style={{ objectPosition }}
                                                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Error')}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full md:w-1/4 pt-4 md:pt-12 text-justify flex flex-col">
                                                <span className="text-[22px] uppercase tracking-[0.05em] font-medium text-[#232A53] mb-2 block md:text-right">{item.category}</span>
                                                <h2 className={`text-3xl md:text-[44px] font-bold text-[#232A53] leading-tight mb-6 uppercase tracking-tight hover:opacity-70 transition-opacity cursor-pointer ${item.titleAlignment === 'left' ? 'text-left' : item.titleAlignment === 'center' ? 'text-center' : item.titleAlignment === 'right' ? 'text-right' : 'text-justify'}`} onClick={() => handleNewsClick(item)}>
                                                    {item.title}
                                                </h2>
                                                <p className={`text-gray-600 leading-relaxed mb-8 break-keep text-justify ${item.fontSize || 'text-base'} ${item.fontWeight || 'font-light'}`}>
                                                    {item.summary}
                                                </p>
                                                <div className="flex justify-between items-end w-full">
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{item.date}</span>
                                                    <button onClick={() => handleNewsClick(item)} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#232A53] transition-all">Read More</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                ) : (
                    /* Simplified List View */
                    <div className="px-6 md:px-12 lg:px-24 pt-[160px] pb-24">
                        <div className="border-t border-gray-200">
                            {newsItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex flex-col md:flex-row justify-between items-start md:items-center py-10 border-b border-gray-100 hover:bg-gray-50/50 transition-all px-4 cursor-pointer snap-start"
                                    onClick={() => handleNewsClick(item)}
                                >
                                    <div className="flex-1 pr-12">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-xs md:text-sm uppercase tracking-widest font-medium text-[#232A53] opacity-60">{item.category}</span>
                                            <span className="text-[10px] text-[#232A53]/40 font-mono italic">#{item.id.toString().padStart(3, '0')}</span>
                                        </div>
                                        <h3 className="text-xl md:text-3xl font-medium text-[#232A53] group-hover:translate-x-2 transition-transform duration-500 uppercase tracking-normal">{item.title}</h3>
                                        <p className="mt-2 text-[10px] md:text-xs text-[#232A53]/40 font-light max-w-3xl break-keep leading-relaxed line-clamp-1">{item.summary}</p>
                                    </div>
                                    <div className="mt-6 md:mt-0 flex items-center gap-8">
                                        <div className="hidden lg:block w-24 aspect-video overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Error')}
                                            />
                                        </div>
                                        <div className="w-8 h-8 border border-gray-100 flex items-center justify-center group-hover:bg-[#232A53] group-hover:text-white transition-all duration-500">
                                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="transform rotate-0 group-hover:-rotate-45 transition-transform">
                                                <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsIndex;

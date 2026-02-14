import React, { useEffect } from 'react';
import { NewsItem } from '../newsData';

interface NewsDetailProps {
    item: NewsItem;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ item }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [item.id]);

    return (
        <div className="pt-32 pb-48 bg-white min-h-screen">
            <div className="max-w-6xl mx-auto px-3 md:px-6">
                <div className="mb-12">
                    <span className="text-[10px] md:text-xs font-bold text-sky-600 uppercase tracking-widest mb-3 block">{item.category}</span>
                    <h1 className={`text-3xl md:text-[44px] font-bold text-[#232A53] leading-tight mt-4 mb-6 uppercase tracking-tight ${item.titleAlignment === 'center' ? 'text-center' : item.titleAlignment === 'right' ? 'text-right' : item.titleAlignment === 'justify' ? 'text-justify' : 'text-left'}`}>
                        {item.title}
                    </h1>
                    <p className="text-gray-400 font-light">{item.date}</p>
                </div>

                <div className="w-full aspect-video overflow-hidden mb-16 bg-gray-100">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=News')}
                    />
                </div>

                <div className={`space-y-8 leading-relaxed text-gray-600 break-keep font-poppins ${item.contentFontSize || 'text-sm'} ${item.contentFontWeight || 'font-normal'}`}>
                    {item.content.map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                    ))}
                </div>

                <div className="mt-24 pt-12 border-t border-gray-100 flex justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="px-12 py-3 rounded-full border border-gray-200 text-gray-400 hover:text-[#232A53] hover:border-[#232A53] transition-all"
                    >
                        Back to News
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;

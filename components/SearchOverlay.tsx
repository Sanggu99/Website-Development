import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { projectsData } from '../data';
import { newsData } from '../newsData';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigateProject: (id: number) => void;
    onNavigateNews: (id: number) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onNavigateProject, onNavigateNews }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            setQuery('');
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    const filteredProjects = query.trim() === '' ? [] : projectsData.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        (p.titleEn && p.titleEn.toLowerCase().includes(query.toLowerCase())) ||
        p.description.some(d => d.toLowerCase().includes(query.toLowerCase())) ||
        p.location.toLowerCase().includes(query.toLowerCase())
    );

    const filteredNews = query.trim() === '' ? [] : newsData.filter(n =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.summary.toLowerCase().includes(query.toLowerCase()) ||
        n.category.toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col py-[20px] px-6 md:px-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-16">
                <button
                    onClick={() => window.location.href = '/'}
                    className="h-10 md:h-12 w-auto transition-all duration-500 ease-in-out"
                >
                    <img
                        src="/logo/SEOP LOGO.png"
                        alt="SEOP"
                        className="h-full w-auto object-contain"
                        style={{
                            filter: 'brightness(0) saturate(100%) invert(14%) sepia(21%) saturate(2311%) hue-rotate(203deg) brightness(91%) contrast(92%)'
                        }}
                    />
                </button>
                <button onClick={onClose} className="p-2 text-[#232A53] hover:scale-110 transition-transform">
                    <X size={40} strokeWidth={1.5} />
                </button>
            </div>

            <div className="max-w-4xl mx-auto w-full">
                <div className="relative border-b-2 border-[#232A53]/20 focus-within:border-[#232A53] transition-colors pb-4 flex items-center">
                    <Search size={32} className="text-[#232A53] opacity-40 mr-4" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search projects, news, location..."
                        className="w-full text-2xl md:text-4xl font-poppins font-light bg-transparent outline-none text-[#232A53] placeholder:opacity-20"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="mt-12 overflow-y-auto max-h-[60vh] pr-4 space-y-12 pb-12">
                    {query.trim() !== '' && filteredProjects.length === 0 && filteredNews.length === 0 && (
                        <p className="text-[#232A53] opacity-40 text-xl font-light">No results found for "{query}"</p>
                    )}

                    {filteredProjects.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#232A53] opacity-60">Projects</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {filteredProjects.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => { onNavigateProject(p.id); onClose(); }}
                                        className="flex items-start gap-4 group text-left"
                                    >
                                        <div className="w-24 aspect-square bg-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={p.heroImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-medium text-[#232A53] group-hover:opacity-60 transition-opacity uppercase">
                                                {p.titleEn || p.title}
                                                {p.titleEn && p.title && <span className="ml-2 text-sm font-normal opacity-60 normal-case">({p.title})</span>}
                                            </h4>
                                            <p className="text-sm text-[#232A53] opacity-60">{p.year} / {p.location}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredNews.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-[#232A53] opacity-60">News</h3>
                            <div className="flex flex-col gap-6">
                                {filteredNews.map(n => (
                                    <button
                                        key={n.id}
                                        onClick={() => { onNavigateNews(n.id); onClose(); }}
                                        className="flex flex-col text-left group border-b border-gray-100 pb-4"
                                    >
                                        <span className="text-xs text-[#232A53] opacity-40 mb-1">{n.category}</span>
                                        <h4 className="text-xl font-medium text-[#232A53] group-hover:opacity-60 transition-opacity">{n.title}</h4>
                                        <p className="text-sm text-[#232A53] opacity-60 line-clamp-1">{n.summary}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchOverlay;

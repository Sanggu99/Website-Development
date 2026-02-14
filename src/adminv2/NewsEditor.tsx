import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, Newspaper, Calendar, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { contentService } from '../services/contentService';
import { NewsItem } from '../../newsData';

interface NewsEditorProps {
    id?: number;
}

const NewsEditor: React.FC<NewsEditorProps> = ({ id }) => {
    const [newsItem, setNewsItem] = useState<Partial<NewsItem>>({
        title: '',
        category: '당선소식',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        content: [],
        image: '',
        showAsPopup: false,
        externalLink: '',
        layoutType: 'left-image',
        aspectRatio: 'aspect-video',
        objectPosition: 'center',
        fontSize: 'text-sm',
        fontWeight: 'font-normal',
        contentFontSize: 'text-sm',
        contentFontWeight: 'font-normal',
        titleAlignment: 'justify'
    });

    useEffect(() => {
        if (id) {
            const currentNews = contentService.getNews();
            const found = currentNews.find(n => n.id === id);
            if (found) {
                setNewsItem(found);
            }
        }
    }, [id]);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files[0]) {
            const file = files[0];
            try {
                // Upload to cloud
                const publicUrl = await contentService.uploadImage(file);
                setNewsItem(prev => ({ ...prev, image: publicUrl }));
            } catch (error) {
                console.error("Upload failed, falling back to local:", error);

                // Fallback to FileReader
                const reader = new FileReader();
                reader.onload = (event) => {
                    setNewsItem(prev => ({ ...prev, image: event.target?.result as string }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSave = async () => {
        if (!newsItem.title || !newsItem.date) {
            alert('Please fill in at least the Title and Date.');
            return;
        }

        const currentNews = contentService.getNews();
        let itemToSave: NewsItem;

        if (id) {
            itemToSave = { ...newsItem, id } as NewsItem;
        } else {
            const newId = Math.max(...currentNews.map(n => n.id), 0) + 1;
            itemToSave = { ...newsItem, id: newId, content: Array.isArray(newsItem.content) ? newsItem.content : [newsItem.content || ''] } as NewsItem;
        }

        await contentService.saveNewsItem(itemToSave);
        alert('News published successfully!');
        window.location.hash = '#/admin-v2/news';
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-poppins text-[#002D57] p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => window.location.hash = '#/admin-v2/news'}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#002D57] font-bold mb-8 transition-colors text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
                >
                    <ArrowLeft size={16} />
                    Back to News Manager
                </button>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                    <header className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
                                <Newspaper className="text-sky-600" />
                                {id ? 'Edit News Post' : 'Create New Post'}
                            </h1>
                            <p className="text-gray-500 text-sm">Publish updates and announcements</p>
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={newsItem.showAsPopup || false}
                                    onChange={e => setNewsItem({ ...newsItem, showAsPopup: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                />
                                Show as Popup
                            </label>
                            <button
                                onClick={handleSave}
                                className="bg-[#002D57] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-[#003d75] transition-all flex items-center gap-2"
                            >
                                <Save size={18} />
                                {id ? 'Update Post' : 'Publish Post'}
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Image & Style Controls (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Thumbnail Image</label>
                                <div
                                    className={`bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-sky-300 transition-colors text-center cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center
                                        ${newsItem.aspectRatio === 'aspect-square' ? 'aspect-square' : newsItem.aspectRatio === 'aspect-video' ? 'aspect-video' : 'h-64'}
                                    `}
                                    onClick={() => {
                                        const url = prompt('Enter image URL (or drag & drop file):', newsItem.image);
                                        if (url) setNewsItem({ ...newsItem, image: url });
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    {newsItem.image ? (
                                        newsItem.image && newsItem.image.length > 500000 ? (
                                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                                                <p className="font-bold text-sm">Heavy Image Loaded</p>
                                                <p className="text-xs">Preview disabled for performance</p>
                                            </div>
                                        ) : (
                                            <img
                                                src={newsItem.image}
                                                alt="Preview"
                                                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-60 transition-opacity"
                                                style={{ objectPosition: newsItem.objectPosition }}
                                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Error')}
                                            />
                                        )
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform z-10">
                                                <Upload size={20} className="text-gray-400 group-hover:text-sky-600" />
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium z-10 px-4">Drag & Drop or Click to Upload</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Image Styling Controls */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ratio</label>
                                    <select
                                        value={newsItem.aspectRatio || 'aspect-video'}
                                        onChange={e => setNewsItem({ ...newsItem, aspectRatio: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#002D57]"
                                    >
                                        <option value="aspect-auto">Original</option>
                                        <option value="aspect-video">16:9 (Landscape)</option>
                                        <option value="aspect-[4/3]">4:3 (Standard)</option>
                                        <option value="aspect-square">1:1 (Square)</option>
                                        <option value="aspect-[3/4]">3:4 (Portrait)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Focus</label>
                                    <select
                                        value={newsItem.objectPosition || 'center'}
                                        onChange={e => setNewsItem({ ...newsItem, objectPosition: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#002D57]"
                                    >
                                        <option value="center">Center</option>
                                        <option value="top">Top</option>
                                        <option value="bottom">Bottom</option>
                                        <option value="left">Left</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">TAG</label>
                                    <select
                                        value={newsItem.category}
                                        onChange={e => setNewsItem({ ...newsItem, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] text-sm font-bold text-[#002D57]"
                                    >
                                        <option value="당선소식">당선소식</option>
                                        <option value="수상소식">수상소식</option>
                                        <option value="PRESS">PRESS</option>
                                        <option value="채용공고">채용공고</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            value={newsItem.date}
                                            onChange={e => setNewsItem({ ...newsItem, date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] text-sm font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Content & Layout (8 cols) */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Layout Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Page Layout</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'left-image', label: 'Left Image' },
                                        { id: 'full-width', label: 'Full Width' },
                                        { id: 'right-image', label: 'Right Image' }
                                    ].map((layout) => (
                                        <button
                                            key={layout.id}
                                            onClick={() => setNewsItem({ ...newsItem, layoutType: layout.id as any })}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${newsItem.layoutType === layout.id
                                                ? 'border-[#002D57] bg-[#002D57]/5 text-[#002D57]'
                                                : 'border-gray-100 bg-white hover:border-gray-300 text-gray-400'
                                                }`}
                                        >
                                            <div className="w-full h-12 bg-gray-100 rounded flex gap-1 p-1">
                                                {layout.id === 'left-image' && <><div className="w-1/2 bg-[#002D57]/20 rounded" /><div className="w-1/2 flex flex-col gap-1"><div className="h-1 w-full bg-gray-200" /><div className="h-1 w-2/3 bg-gray-200" /></div></>}
                                                {layout.id === 'full-width' && <div className="w-full h-full flex flex-col gap-1"><div className="w-full h-2/3 bg-[#002D57]/20 rounded" /><div className="h-1 w-full bg-gray-200" /></div>}
                                                {layout.id === 'right-image' && <><div className="w-1/2 flex flex-col gap-1"><div className="h-1 w-full bg-gray-200" /><div className="h-1 w-2/3 bg-gray-200" /></div><div className="w-1/2 bg-[#002D57]/20 rounded" /></>}
                                            </div>
                                            <span className="text-xs font-bold">{layout.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Title & Alignment</label>
                                    <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200 gap-1">
                                        {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                                            <button
                                                key={align}
                                                onClick={() => setNewsItem({ ...newsItem, titleAlignment: align })}
                                                className={`p-1.5 rounded transition-all ${newsItem.titleAlignment === align
                                                    ? 'bg-white shadow text-[#002D57] ring-1 ring-black/5'
                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                title={`Align ${align}`}
                                            >
                                                {align === 'left' && <AlignLeft size={14} />}
                                                {align === 'center' && <AlignCenter size={14} />}
                                                {align === 'right' && <AlignRight size={14} />}
                                                {align === 'justify' && <AlignJustify size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={newsItem.title}
                                    onChange={e => setNewsItem({ ...newsItem, title: e.target.value })}
                                    placeholder="Enter news title..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] text-lg font-bold placeholder-gray-300 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">External Article Link (Optional)</label>
                                <input
                                    type="text"
                                    value={newsItem.externalLink || ''}
                                    onChange={e => setNewsItem({ ...newsItem, externalLink: e.target.value })}
                                    placeholder="https://example.com/article"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] text-sm text-blue-600 placeholder-gray-300 transition-all font-mono"
                                />
                                <p className="text-xs text-gray-400 mt-1">If provided, 'Read More' will link here instead of the detail page.</p>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Summary (List View)</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={newsItem.fontSize || 'text-sm'}
                                            onChange={e => setNewsItem({ ...newsItem, fontSize: e.target.value as any })}
                                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#002D57]"
                                        >
                                            <option value="text-xs">Small</option>
                                            <option value="text-sm">Normal</option>
                                            <option value="text-base">Medium</option>
                                            <option value="text-lg">Large</option>
                                        </select>
                                        <select
                                            value={newsItem.fontWeight || 'font-normal'}
                                            onChange={e => setNewsItem({ ...newsItem, fontWeight: e.target.value as any })}
                                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#002D57]"
                                        >
                                            <option value="font-normal">Regular</option>
                                            <option value="font-medium">Medium</option>
                                            <option value="font-bold">Bold</option>
                                        </select>
                                    </div>
                                </div>
                                <textarea
                                    value={newsItem.summary}
                                    onChange={e => setNewsItem({ ...newsItem, summary: e.target.value })}
                                    placeholder="Short description for the list view..."
                                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] h-24 resize-none leading-relaxed placeholder-gray-300 transition-all font-poppins ${newsItem.fontSize} ${newsItem.fontWeight}`}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Content (Detail View)</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={newsItem.contentFontSize || 'text-sm'}
                                            onChange={e => setNewsItem({ ...newsItem, contentFontSize: e.target.value as any })}
                                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#002D57]"
                                        >
                                            <option value="text-xs">Small</option>
                                            <option value="text-sm">Normal</option>
                                            <option value="text-base">Medium</option>
                                            <option value="text-lg">Large</option>
                                        </select>
                                        <select
                                            value={newsItem.contentFontWeight || 'font-normal'}
                                            onChange={e => setNewsItem({ ...newsItem, contentFontWeight: e.target.value as any })}
                                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#002D57]"
                                        >
                                            <option value="font-normal">Regular</option>
                                            <option value="font-medium">Medium</option>
                                            <option value="font-bold">Bold</option>
                                        </select>
                                    </div>
                                </div>
                                <textarea
                                    value={Array.isArray(newsItem.content) ? newsItem.content.join('\n\n') : newsItem.content}
                                    onChange={e => setNewsItem({ ...newsItem, content: e.target.value.split('\n\n') })}
                                    placeholder="Write your article content here..."
                                    className={`w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] h-64 resize-y leading-relaxed placeholder-gray-300 transition-all font-poppins ${newsItem.contentFontSize || 'text-sm'} ${newsItem.contentFontWeight || 'font-normal'}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsEditor;

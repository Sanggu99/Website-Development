import React, { useState, useEffect } from 'react';
import { contentService } from '../services/contentService';
import { Edit, Trash2, Plus, Search, ArrowLeft, Newspaper, GripVertical, Calendar } from 'lucide-react';
import { NewsItem } from '../../newsData'; // Ensure correct import for type if needed

const NewsManager: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [newsList, setNewsList] = useState(contentService.getNews());
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    // Sync with service updates
    useEffect(() => {
        const handleUpdate = () => setNewsList(contentService.getNews());
        window.addEventListener('seop_news_updated', handleUpdate);
        return () => window.removeEventListener('seop_news_updated', handleUpdate);
    }, []);

    const filteredNews = newsList.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this news item?')) {
            const newList = newsList.filter(n => n.id !== id);
            setNewsList(newList);
            contentService.saveNews(newList);
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        if (searchTerm) return; // Disable drag when filtering
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // Make the drag ghost transparent or custom if desired, but default is fine
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        e.preventDefault(); // Necessary to allow dropping
        if (draggedItemIndex === null || draggedItemIndex === index || searchTerm) return;

        const newList = [...newsList];
        const draggedItem = newList[draggedItemIndex];

        // Remove item from old position
        newList.splice(draggedItemIndex, 1);
        // Insert item at new position
        newList.splice(index, 0, draggedItem);

        setNewsList(newList);
        setDraggedItemIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
        // Only update local state. User must explicitly click "Save Order" to commit changes.
        // contentService.saveNews(newsList); <--- REMOVED to prevent OOM
    };

    const handleSortByDate = () => {
        if (!window.confirm('Sort all news items by Date (Newest first)? This updates the local order. Click "Save Order" to persist ID changes to the database.')) return;

        const sorted = [...newsList].sort((a, b) => {
            // Descending sort (Newest first) assuming YYYY.MM.DD format
            return b.date.localeCompare(a.date);
        });

        setNewsList(sorted);
        contentService.saveNews(sorted);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-poppins text-[#002D57] p-8 md:p-12">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => window.location.hash = '#/admin-v2'}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#002D57] font-bold mb-8 transition-colors text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                            <Newspaper size={32} />
                            NEWS MANAGER
                        </h1>
                        <p className="text-gray-500 text-sm">Manage press releases, articles, and announcements</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search news..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] text-sm"
                            />
                        </div>
                        <button
                            onClick={handleSortByDate}
                            className="bg-white text-[#002D57] border border-[#002D57] px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Calendar size={16} />
                            Sort Date
                        </button>
                        <button
                            onClick={() => window.location.hash = '#/admin-v2/news/new'}
                            className="bg-[#002D57] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#003d75] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus size={16} />
                            Add News
                        </button>
                    </div>
                </header>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-4 px-4 w-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">No.</th>
                                    <th className="py-4 px-4 w-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider"></th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Thumbnail</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Title / Summary</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredNews.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        draggable={!searchTerm}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`group hover:bg-sky-50/30 transition-colors ${draggedItemIndex === index ? 'bg-sky-50 opacity-50' : ''}`}
                                    >
                                        <td className="py-4 px-4 text-center text-sm font-mono text-gray-400">
                                            {index + 1}
                                        </td>
                                        <td className="py-4 px-4 text-center cursor-move text-gray-300 hover:text-[#002D57]">
                                            {!searchTerm && <GripVertical size={20} />}
                                        </td>
                                        <td className="py-4 px-6 w-32">
                                            <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative group-hover:scale-105 transition-transform pointer-events-none">
                                                {item.image && item.image.length > 500000 ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs text-gray-500">Heavy Image</div>
                                                ) : (
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-sm">
                                            <div className="font-bold text-[#002D57] line-clamp-1 mb-1">{item.title}</div>
                                            <div className="text-xs text-gray-400 line-clamp-2">{item.summary}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${item.category === 'AWARD' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                                                item.category === 'EXHIBITION' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-400 font-mono">
                                            {item.date}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => window.location.hash = `#/admin-v2/news/${item.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsManager;

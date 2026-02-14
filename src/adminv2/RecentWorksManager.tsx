
import React, { useState, useEffect } from 'react';
import { contentService, RecentWorkData } from '../services/contentService'; // Ensure this type is exported
import { Edit, Trash2, Plus, ArrowLeft, GripVertical, Columns } from 'lucide-react';

const RecentWorksManager: React.FC = () => {
    const [works, setWorks] = useState<RecentWorkData[]>(contentService.getRecentWorks());
    const [activeTab, setActiveTab] = useState<number>(1);
    const [draggedItem, setDraggedItem] = useState<number | null>(null); // Index within the filtered list

    useEffect(() => {
        const handleUpdate = () => setWorks(contentService.getRecentWorks());
        window.addEventListener('seop_recent_works_updated', handleUpdate);

        // Initial fetch just in case
        contentService.fetchRecentWorks();

        return () => window.removeEventListener('seop_recent_works_updated', handleUpdate);
    }, []);

    // Filter by active column tab
    const filteredWorks = works.filter(w => w.columnIndex === activeTab);

    // Sort logic handled by fetch, but local reordering needs care
    // (Assuming they are already sorted by orderIndex)

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this Work?')) {
            await contentService.deleteRecentWork(id);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItem(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItem === null) return;
        if (draggedItem === index) return;
    };

    const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedItem === null) return;

        const currentList = [...filteredWorks];
        const itemToMove = currentList[draggedItem];

        // Remove from old pos, insert at new
        currentList.splice(draggedItem, 1);
        currentList.splice(targetIndex, 0, itemToMove);

        // Update order indexes
        const updatedList = currentList.map((item, idx) => ({
            ...item,
            orderIndex: idx
        }));

        // We need to save EACH item's new order...
        // This is inefficient but functional for small lists (Recent Works usually has < 10 items)
        for (const item of updatedList) {
            await contentService.saveRecentWork(item);
        }

        setDraggedItem(null);
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
                        <h1 className="text-3xl font-bold tracking-tight mb-2">RECENT WORKS MANAGER</h1>
                        <p className="text-gray-500 text-sm">Manage the three scrolling columns on the Recent Works page.</p>
                    </div>
                    <button
                        onClick={() => window.location.hash = `#/admin-v2/recent-works/new?col=${activeTab}`}
                        className="bg-[#002D57] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#003d75] transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add to Column {activeTab}
                    </button>
                </header>

                {/* Column Tabs */}
                <div className="flex gap-4 mb-8">
                    {[1, 2, 3].map(col => (
                        <button
                            key={col}
                            onClick={() => setActiveTab(col)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === col
                                    ? 'bg-[#002D57] text-white shadow-md'
                                    : 'bg-white text-gray-400 hover:text-[#002D57] hover:bg-gray-50'
                                }`}
                        >
                            <Columns size={18} />
                            Column {col}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                    {filteredWorks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <p>No works in Column {activeTab} yet.</p>
                            <button
                                onClick={() => window.location.hash = `#/admin-v2/recent-works/new?col=${activeTab}`}
                                className="mt-4 text-[#002D57] font-bold underline"
                            >
                                Create One
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="py-4 px-6 w-12 text-center">#</th>
                                        <th className="py-4 px-6 w-12 text-center">Sort</th>
                                        <th className="py-4 px-6">Thumbnail (Main View)</th>
                                        <th className="py-4 px-6">Title</th>
                                        <th className="py-4 px-6">Speed</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredWorks.map((work, index) => (
                                        <tr
                                            key={work.id}
                                            className={`group hover:bg-blue-50/30 transition-colors ${draggedItem === index ? 'opacity-50 bg-blue-50' : ''}`}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => handleDrop(e, index)}
                                        >
                                            <td className="py-4 px-6 text-center text-gray-400 font-mono text-xs">{index + 1}</td>
                                            <td className="py-4 px-6 text-center cursor-move text-gray-300 hover:text-[#002D57]">
                                                <GripVertical size={16} />
                                            </td>
                                            <td className="py-4 px-6 w-32">
                                                <div className="w-20 h-32 bg-gray-100 rounded overflow-hidden">
                                                    {work.thumbnailUrl ? (
                                                        <img src={work.thumbnailUrl} alt="Thumb" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-[#002D57]">
                                                {work.titleEn || work.title}
                                                <div className="text-xs text-gray-400 font-normal mt-1">{work.titleKr}</div>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-sm text-gray-600">
                                                x{work.scrollSpeed}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => window.location.hash = `#/admin-v2/recent-works/${work.id}`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(work.id)}
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentWorksManager;

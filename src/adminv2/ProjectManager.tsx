import React, { useState, useEffect, useRef } from 'react';
import { contentService } from '../services/contentService';
import { Edit, Trash2, Plus, Search, ArrowLeft, GripVertical } from 'lucide-react';
import { ProjectData } from '../../types';

const ProjectManager: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState<ProjectData[]>(contentService.getProjects());
    const [draggedItem, setDraggedItem] = useState<number | null>(null);

    useEffect(() => {
        const handleUpdate = () => setProjects(contentService.getProjects());
        window.addEventListener('seop_projects_updated', handleUpdate);
        return () => window.removeEventListener('seop_projects_updated', handleUpdate);
    }, []);

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.titleEn && p.titleEn.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = (id: number) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            const newList = projects.filter(p => p.id !== id);
            contentService.saveProjects(newList);
            setProjects(newList);
            alert('삭제되었습니다.');
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
        // Make the drag transparent/custom ghost image if needed, but default is fine
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedItem === null) return;
        if (draggedItem === index) return;

        // Visual feedback could be added here (e.g. placeholder line)
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItem === null) return;

        // Reorder list
        const newProjects = [...projects];
        const itemToMove = newProjects[draggedItem];
        newProjects.splice(draggedItem, 1);
        newProjects.splice(index, 0, itemToMove);

        setProjects(newProjects);
        setDraggedItem(null);

        // DISABLED: Auto-save on drag to prevent conflicts during concurrent editing
        // Save new order to storage/service
        // contentService.saveProjects(newProjects);
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
                        <h1 className="text-3xl font-bold tracking-tight mb-2">PROJECT MANAGER</h1>
                        <p className="text-gray-500 text-sm">Manage and edit your architectural portfolio</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] text-sm"
                            />
                        </div>
                        <button
                            onClick={() => window.location.hash = '#/admin-v2/works/new'}
                            className="bg-[#002D57] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#003d75] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus size={16} />
                            Add Project
                        </button>
                    </div>
                </header>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">No.</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">Sort</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Thumbnail</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Project Info</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Year</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredProjects.map((project, index) => (
                                    <tr
                                        key={project.id}
                                        className={`group hover:bg-blue-50/30 transition-colors ${draggedItem === index ? 'opacity-50 bg-blue-50' : ''}`}
                                        draggable={!searchTerm} // Only allow drag if not filtering
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                    >
                                        <td className="py-4 px-6 text-center text-sm font-mono text-gray-400">
                                            {index + 1}
                                        </td>
                                        <td className="py-4 px-6 text-center cursor-move text-gray-300 hover:text-[#002D57]">
                                            {!searchTerm && <GripVertical size={16} />}
                                        </td>
                                        <td className="py-4 px-6 w-24">
                                            <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 relative group-hover:scale-105 transition-transform">
                                                <img src={project.heroImage} alt={project.title} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-[#002D57]">{project.titleEn || 'Untitled Project'}</div>
                                            <div className="text-sm text-gray-500">{project.title}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(project.category) ? (
                                                    project.category.map(c => (
                                                        <span key={c} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                                                            {c}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                                                        {project.category || 'Uncategorized'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500 font-mono">
                                            {project.year}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => window.location.hash = `#/admin-v2/works/${project.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
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

export default ProjectManager;

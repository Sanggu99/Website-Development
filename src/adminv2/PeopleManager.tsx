import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, ArrowLeft, Users, GripVertical } from 'lucide-react';
import { contentService, Person } from '../services/contentService';

const PeopleManager: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [peopleList, setPeopleList] = useState<Person[]>(contentService.getPeople());
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    // Sync with service updates
    useEffect(() => {
        const handleUpdate = () => setPeopleList(contentService.getPeople());
        window.addEventListener('seop_people_updated', handleUpdate);
        return () => window.removeEventListener('seop_people_updated', handleUpdate);
    }, []);

    const filteredPeople = peopleList.filter(p =>
        p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nameKr.includes(searchTerm)
    );

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this member?')) {
            const newList = peopleList.filter(p => p.id !== id);
            setPeopleList(newList);
            contentService.savePeople(newList);
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        if (searchTerm) return; // Disable drag when filtering
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index || searchTerm) return;

        const newList = [...peopleList];
        const draggedItem = newList[draggedItemIndex];

        // Remove item from old position
        newList.splice(draggedItemIndex, 1);
        // Insert item at new position
        newList.splice(index, 0, draggedItem);

        setPeopleList(newList);
        setDraggedItemIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
        contentService.savePeople(peopleList);
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
                            <Users size={32} />
                            PEOPLE MANAGER
                        </h1>
                        <p className="text-gray-500 text-sm">Manage team members and their profiles</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] text-sm"
                            />
                        </div>
                        <button
                            onClick={() => window.location.hash = '#/admin-v2/people/new'}
                            className="bg-[#002D57] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#003d75] transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus size={16} />
                            Add Member
                        </button>
                    </div>
                </header>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-4 px-4 w-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider"></th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Profile</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Name/Role</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPeople.map((person, index) => (
                                    <tr
                                        key={person.id}
                                        draggable={!searchTerm}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`group hover:bg-blue-50/30 transition-colors ${draggedItemIndex === index ? 'bg-blue-50 opacity-50' : ''}`}
                                    >
                                        <td className="py-4 px-4 text-center cursor-move text-gray-300 hover:text-[#002D57]">
                                            {!searchTerm && <GripVertical size={20} />}
                                        </td>
                                        <td className="py-4 px-6 w-24">
                                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md pointer-events-none">
                                                <img src={person.imageBw} alt={person.nameEn} className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-[#002D57]">{person.nameEn}</div>
                                            <div className="text-sm text-gray-500">{person.nameKr} <span className="mx-2">•</span> <span className="text-blue-600 font-medium">{person.role}</span></div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => window.location.hash = `#/admin-v2/people/${person.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(person.id)}
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

export default PeopleManager;

import React, { useState } from 'react';
import { ArrowLeft, Save, Upload, User } from 'lucide-react';
import { contentService, Person } from '../services/contentService';

const PeopleEditor: React.FC = () => {
    // State for the person being edited
    const [person, setPerson] = useState<Partial<Person>>({
        nameEn: '',
        nameKr: '',
        role: '',
        imageBw: '',
        imageColor: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Initialize from URL
    React.useEffect(() => {
        const hash = window.location.hash;
        if (hash.startsWith('#/admin-v2/people/') && hash !== '#/admin-v2/people/new') {
            const id = parseInt(hash.replace('#/admin-v2/people/', ''), 10);
            if (!isNaN(id)) {
                const people = contentService.getPeople();
                const found = people.find(p => p.id === id);
                if (found) {
                    setPerson(found);
                    setIsEditing(true);
                    setEditId(id);
                }
            }
        }
    }, []);

    const handleDrop = (field: 'imageBw' | 'imageColor') => async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files[0]) {
            const file = files[0];

            try {
                // Upload to cloud
                const publicUrl = await contentService.uploadImage(file);
                setPerson(prev => ({ ...prev, [field]: publicUrl }));
            } catch (error) {
                console.error("Upload failed, falling back to local:", error);

                // Fallback to FileReader
                const reader = new FileReader();
                reader.onload = (event) => {
                    setPerson(prev => ({ ...prev, [field]: event.target?.result as string }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSave = async () => {
        if (!person.nameEn) {
            alert('Name is required');
            return;
        }

        const currentPeople = contentService.getPeople();
        let personToSave: Person;

        if (isEditing && editId !== null) {
            personToSave = { ...person, id: editId } as Person;
        } else {
            const newId = Math.max(...currentPeople.map(p => p.id), 0) + 1;
            personToSave = { ...person, id: newId } as Person;
        }

        await contentService.savePerson(personToSave);
        alert(isEditing ? 'Member updated!' : 'Team member added!');
        window.location.hash = '#/admin-v2/people';
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-poppins text-[#002D57] p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => window.location.hash = '#/admin-v2/people'}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#002D57] font-bold mb-8 transition-colors text-sm bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
                >
                    <ArrowLeft size={16} />
                    Back to People Manager
                </button>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                    <header className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
                                <User className="text-blue-600" />
                                {person.nameEn ? `Edit: ${person.nameEn}` : 'New Team Member'}
                            </h1>
                            <p className="text-gray-500 text-sm">Add or update team member details</p>
                        </div>
                        <button
                            onClick={handleSave}
                            className="bg-[#002D57] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-[#003d75] transition-all flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Profile
                        </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Image Uploads */}
                        <div className="space-y-6">
                            {/* Black & White Image */}
                            <div
                                className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors text-center cursor-pointer group relative overflow-hidden h-64 flex flex-col items-center justify-center"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop('imageBw')}
                                onClick={() => {
                                    const url = prompt('Enter Black & White Photo URL:', person.imageBw);
                                    if (url) setPerson({ ...person, imageBw: url });
                                }}
                            >
                                {person.imageBw ? (
                                    <img src={person.imageBw} alt="BW Preview" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload size={24} className="text-gray-400 group-hover:text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-700 mb-1">Black & White Photo</h3>
                                        <p className="text-xs text-gray-400">Drag & Drop or Click URL</p>
                                    </>
                                )}
                            </div>

                            {/* Color Image */}
                            <div
                                className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors text-center cursor-pointer group relative overflow-hidden h-64 flex flex-col items-center justify-center"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop('imageColor')}
                                onClick={() => {
                                    const url = prompt('Enter Color Photo URL:', person.imageColor);
                                    if (url) setPerson({ ...person, imageColor: url });
                                }}
                            >
                                {person.imageColor ? (
                                    <img src={person.imageColor} alt="Color Preview" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload size={24} className="text-gray-400 group-hover:text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-gray-700 mb-1">Color Photo (Hover)</h3>
                                        <p className="text-xs text-gray-400">Drag & Drop or Click URL</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name (English)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] transition-all"
                                    placeholder="e.g. SANGSUN PARK"
                                    value={person.nameEn}
                                    onChange={e => setPerson({ ...person, nameEn: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name (Korean)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] transition-all"
                                    placeholder="e.g. 박상선"
                                    value={person.nameKr}
                                    onChange={e => setPerson({ ...person, nameKr: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Role / Position</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#002D57] transition-all appearance-none cursor-pointer"
                                    value={person.role}
                                    onChange={e => setPerson({ ...person, role: e.target.value })}
                                >
                                    <option value="">Select Role...</option>
                                    <option value="CEO">CEO</option>
                                    <option value="PRINCIPAL">PRINCIPAL</option>
                                    <option value="DIRECTOR">DIRECTOR</option>
                                    <option value="TEAM LEADER">TEAM LEADER</option>
                                    <option value="ARCHITECT">ARCHITECT</option>
                                    <option value="INTERN">INTERN</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PeopleEditor;

import { Users, Building2, Newspaper, Clock, Plus, ArrowRight } from 'lucide-react';
import { contentService } from '../services/contentService';

const AdminDashboard: React.FC = () => {
    const collections = [
        {
            id: 'people',
            title: 'PEOPLE',
            icon: Users,
            description: 'Manage team members and profiles',
            bg: 'bg-blue-50',
            color: 'text-blue-600',
            count: 'Team Members',
            actions: [
                {
                    label: 'Manage',
                    onClick: () => window.location.hash = '#/admin-v2/people',
                    secondary: true
                },
                {
                    label: 'Add Member',
                    onClick: () => window.location.hash = '#/admin-v2/people/new',
                    secondary: false
                }
            ]
        },
        {
            id: 'works',
            title: 'WORKS',
            icon: Building2,
            description: 'Manage architectural projects and portfolios',
            bg: 'bg-indigo-50',
            color: 'text-[#002D57]',
            count: '24 Projects',
            actions: [
                {
                    label: 'Manage',
                    onClick: () => window.location.hash = '#/admin-v2/works',
                    secondary: true
                },
                {
                    label: 'Add Project',
                    onClick: () => window.location.hash = '#/admin-v2/works/new',
                    secondary: false
                }
            ]
        },
        {
            id: 'news',
            title: 'NEWS',
            icon: Newspaper,
            description: 'Update news, press releases, and articles',
            bg: 'bg-sky-50',
            color: 'text-sky-600',
            count: '8 Posts',
            actions: [
                {
                    label: 'Manage',
                    onClick: () => window.location.hash = '#/admin-v2/news',
                    secondary: true
                },
                {
                    label: 'Add News',
                    onClick: () => window.location.hash = '#/admin-v2/news/new',
                    secondary: false
                }
            ]
        },
        {
            id: 'recent-works',
            title: 'RECENT WORKS',
            icon: Clock,
            description: 'Manage recent works showcase',
            bg: 'bg-purple-50',
            color: 'text-purple-600',
            count: '3 Columns',
            actions: [
                {
                    label: 'Manage',
                    onClick: () => window.location.hash = '#/admin-v2/recent-works',
                    secondary: true
                },
                {
                    label: 'Add Work',
                    onClick: () => window.location.hash = '#/admin-v2/recent-works/new',
                    secondary: false
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#F5F5F7] font-poppins selection:bg-[#002D57]/10 p-8 md:p-16">
            <div className="max-w-6xl mx-auto">
                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#002D57] rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#002D57] tracking-tight">ADMIN DASHBOARD</h1>
                            <p className="text-sm text-gray-500 font-medium">Manage your website content efficiently</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {collections.map((collection) => (
                        <div key={collection.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                            <div className="relative z-10">
                                <div className={`w-14 h-14 ${collection.bg} ${collection.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <collection.icon size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{collection.title}</h3>
                                <p className="text-gray-500 text-sm mb-6">{collection.description}</p>

                                <div className="flex items-center justify-between mt-8">
                                    <span className="text-xs font-bold text-gray-300 bg-gray-50 px-3 py-1 rounded-full">{collection.count}</span>

                                    {/* @ts-ignore */}
                                    {collection.actions ? (
                                        <div className="flex gap-2">
                                            {/* @ts-ignore */}
                                            {collection.actions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={action.onClick}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${action.secondary ? 'bg-white text-[#002D57] hover:bg-gray-50' : 'bg-[#002D57] text-white hover:bg-[#003d75]'}`}
                                                >
                                                    {!action.secondary && <Plus size={14} />}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                        // @ts-ignore
                                    ) : collection.action ? (
                                        <button
                                            // @ts-ignore
                                            onClick={collection.action.onClick}
                                            className="flex items-center gap-2 bg-[#002D57] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-[#003d75] hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                        >
                                            <Plus size={16} />
                                            {/* @ts-ignore */}
                                            {collection.action.label}
                                        </button>
                                    ) : (
                                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#002D57] group-hover:text-white transition-all">
                                            <ArrowRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Decorative Background */}
                            <div className={`absolute -right-10 -bottom-10 w-64 h-64 ${collection.bg} rounded-full opacity-50 blur-3xl group-hover:opacity-100 transition-opacity`}></div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-[#002D57] mb-4">Migration & Settings</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Use this tool to migrate existing local images to Supabase Cloud Storage. This ensures all images are visible to other team members.
                    </p>
                    <button
                        onClick={async () => {
                            if (confirm('This will upload all local images to Supabase Cloud. It may take a few minutes. Continue?')) {
                                await contentService.migrateAllLocalImagesToCloud((msg) => console.log(msg));
                            }
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-md flex items-center gap-2"
                    >
                        <Building2 size={18} />
                        Migrate Local Images to Cloud
                    </button>
                    <p className="text-xs text-orange-400 mt-2 font-medium">Warning: Do not close the browser while migrating.</p>
                </div>

                <div className="mt-8 bg-white rounded-3xl p-8 border border-red-100 shadow-sm">
                    <h3 className="text-xl font-bold text-red-800 mb-4">Emergency Data Restore</h3>
                    <p className="text-sm text-red-600 mb-4">
                        Lost data? Click below to wipe the cloud database and restore the original hardcoded projects/news/people.
                        <br />
                        <strong>Use this only if your project list is empty or corrupted.</strong>
                    </p>
                    <button
                        onClick={() => contentService.restoreDefaults()}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-md flex items-center gap-2"
                    >
                        Restore Default Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

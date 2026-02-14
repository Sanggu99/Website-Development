
import * as React from 'react';
import { useState, useEffect } from 'react';
import { contentService, RecentWorkData } from '../services/contentService';
// @ts-ignore
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import {
    Plus,
    Type,
    Image as ImageIcon,
    Save,
    Trash2,
    Grid3X3,
    MoveVertical,
    CheckCircle2,
    X,
    Maximize2,
    AlignLeft,
    Settings,
    ArrowLeft
} from 'lucide-react';
import { Block, LayoutItem } from '../../types';
import * as _ from 'lodash';

// Styles
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Safety check for imports
const ResponsiveGridLayout = (Responsive && WidthProvider) ? WidthProvider(Responsive) : null;

const RecentWorksEditor: React.FC = () => {
    // Recent Work Meta State
    const [titleEn, setTitleEn] = useState('New Work Title');
    const [titleKr, setTitleKr] = useState('새 작업 제목');
    const [description, setDescription] = useState('');
    const [columnIndex, setColumnIndex] = useState<number>(1);
    const [scrollSpeed, setScrollSpeed] = useState<number>(1.0);
    const [thumbnailUrl, setThumbnailUrl] = useState('');

    // Editor State
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [activeBlock, setActiveBlock] = useState<string | null>(null);
    const [showGrid, setShowGrid] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Categories not really used for Recent Works? Maybe just reuse 'category' string
    const [category, setCategory] = useState('Architecture');

    // Grid Config
    const GRID_COLS = 24;
    const GRID_ROW_HEIGHT = 40;
    const cols = { lg: GRID_COLS, md: 20, sm: 12, xs: 8, xxs: 4 };
    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

    useEffect(() => {
        if (!Responsive || !WidthProvider) {
            setError('Failed to load grid layout libraries.');
        }

        // Check URL for ID or active column
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        const colParam = urlParams.get('col');
        if (colParam) setColumnIndex(parseInt(colParam));

        if (hash.includes('/recent-works/') && !hash.endsWith('/new')) {
            const id = parseInt(hash.split('/recent-works/')[1]?.split('?')[0] || '0', 10);

            const works = contentService.getRecentWorks();
            const work = works.find(w => w.id === id);

            if (work) {
                setTitleEn(work.titleEn || work.title);
                setTitleKr(work.titleKr || '');
                setDescription(work.description || '');
                setCategory(work.category || '');
                setColumnIndex(work.columnIndex);
                setScrollSpeed(work.scrollSpeed);
                setThumbnailUrl(work.thumbnailUrl);
                setBlocks(work.contentBlocks || []);
            }
        }
    }, []);

    const addBlock = (type: Block['type']) => {
        const id = `block-${Date.now()}`;
        const baseLayout = { i: id, x: 0, y: Infinity, w: 24, h: 4 }; // Default full width
        let newBlock: Block;

        switch (type) {
            case 'text':
                newBlock = { id, type: 'text', content: { text: 'Description...', fontSize: '14px' }, layout: { ...baseLayout, w: 24, h: 6 } };
                break;
            case 'heading':
                newBlock = { id, type: 'heading', content: { text: 'SECTION TITLE' }, layout: { ...baseLayout, h: 2 } };
                break;
            case 'image':
                newBlock = { id, type: 'image', content: { src: '' }, layout: { ...baseLayout, w: 24, h: 10 } };
                break;
            case 'spacer':
                newBlock = { id, type: 'spacer', content: {}, layout: { ...baseLayout, h: 2 } };
                break;
            default: return;
        }
        setBlocks(prev => [...prev, newBlock]);
        setActiveBlock(id);
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        setActiveBlock(null);
    };

    const updateBlockContent = (id: string, content: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...content } } : b));
    };

    // simplified layout change handler
    const onLayoutChange = (layout: LayoutItem[]) => {
        setBlocks(prev => prev.map(b => {
            const l = layout.find(i => i.i === b.id);
            return l ? { ...b, layout: l } : b;
        }));
    };

    const handleDropOnBlock = async (id: string, e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files[0]) {
            try {
                const url = await contentService.uploadImage(files[0]);
                if (id === 'thumbnail') {
                    setThumbnailUrl(url);
                } else {
                    updateBlockContent(id, { src: url, previewSrc: url });
                }
            } catch (e) { console.error(e); }
        }
    };

    const saveWork = async () => {
        setIsSaving(true);
        try {
            // Upload base64 block images if any
            const processedBlocks = await Promise.all(blocks.map(async (block) => {
                if (block.type === 'image' && block.content.src?.startsWith('data:')) {
                    const res = await fetch(block.content.src);
                    const blob = await res.blob();
                    const file = new File([blob], `img-${Date.now()}.webp`, { type: 'image/webp' });
                    const url = await contentService.uploadImage(file);
                    return { ...block, content: { ...block.content, src: url, previewSrc: url } };
                }
                return block;
            }));

            // Handle Thumbnail
            let finalThumb = thumbnailUrl;
            if (thumbnailUrl.startsWith('data:')) {
                const res = await fetch(thumbnailUrl);
                const blob = await res.blob();
                const file = new File([blob], `thumb-${Date.now()}.webp`, { type: 'image/webp' });
                finalThumb = await contentService.uploadImage(file);
            }

            const hash = window.location.hash;
            const isEditing = hash.includes('/recent-works/') && !hash.endsWith('/new');
            const urlId = isEditing ? parseInt(hash.split('/recent-works/')[1] || '0') : undefined;

            const workData: RecentWorkData = {
                id: urlId || Date.now(),
                title: titleEn,
                titleEn,
                titleKr,
                description,
                category,
                columnIndex,
                scrollSpeed,
                thumbnailUrl: finalThumb,
                contentBlocks: processedBlocks,
                orderIndex: 0 // handled by manager mostly
            };

            await contentService.saveRecentWork(workData);
            alert('Recent Work Saved!');
            window.location.hash = '#/admin-v2/recent-works';
        } catch (e) {
            console.error(e);
            alert('Save Failed');
        } finally {
            setIsSaving(false);
        }
    };

    if (!ResponsiveGridLayout) return <div>Loading Grid...</div>;

    return (
        <div className="fixed inset-0 bg-[#F5F5F7] flex flex-col font-poppins overflow-hidden z-[9999]">
            {/* Header */}
            <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-[100] shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.location.hash = '#/admin-v2/recent-works'} className="p-1 hover:bg-gray-100 rounded">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="font-bold text-[#002D57]">RECENT WORK EDITOR</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowGrid(!showGrid)} className="text-xs bg-gray-100 px-3 py-1 rounded">Grid {showGrid ? 'On' : 'Off'}</button>
                    <button onClick={saveWork} disabled={isSaving} className="text-xs bg-[#002D57] text-white px-4 py-1 rounded font-bold">
                        {isSaving ? 'Saving...' : 'Save Work'}
                    </button>
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-72 bg-white border-r border-gray-200 p-5 overflow-y-auto z-50 flex flex-col gap-6">
                    {/* Meta Fields */}
                    <div className="space-y-4 border-b border-gray-100 pb-6">
                        <h3 className="text-xs font-bold text-gray-400">SETTINGS</h3>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500">COLUMN (1-3)</label>
                            <div className="flex gap-2 mt-1">
                                {[1, 2, 3].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColumnIndex(c)}
                                        className={`flex-1 py-1 text-xs border rounded ${columnIndex === c ? 'bg-[#002D57] text-white border-[#002D57]' : 'bg-white text-gray-500'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500">SCROLL SPEED (0.5 - 5.0)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="10"
                                value={scrollSpeed}
                                onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                                className="w-full text-xs p-2 border rounded mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500">THUMBNAIL (List View)</label>
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDropOnBlock('thumbnail', e)}
                                className="w-full h-32 bg-gray-50 border border-dashed rounded mt-1 overflow-hidden relative"
                            >
                                {thumbnailUrl ? (
                                    <img src={thumbnailUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">Drop Image</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Block Tools */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 mb-2">ADD BLOCKS</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['text', 'image', 'heading', 'spacer'].map(t => (
                                <button
                                    key={t}
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData("text/plain", t as string)}
                                    onClick={() => addBlock(t as any)}
                                    className="p-3 border rounded text-xs hover:bg-gray-50 text-left capitalize"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Canvas */}
                <main className="flex-grow bg-[#E5E5E7] p-8 overflow-y-auto">
                    <div className="max-w-[1000px] mx-auto bg-white shadow-xl min-h-screen flex flex-col">
                        {/* Title Section */}
                        <div className="p-8 border-b">
                            <input
                                value={titleEn}
                                onChange={e => setTitleEn(e.target.value)}
                                className="w-full text-3xl font-bold uppercase text-[#002D57] placeholder-gray-300"
                                placeholder="TITLE (EN)"
                            />
                            <input
                                value={titleKr}
                                onChange={e => setTitleKr(e.target.value)}
                                className="w-full text-xl font-bold text-gray-600 mt-2 placeholder-gray-300"
                                placeholder="제목 (국문)"
                            />
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full mt-4 text-sm text-gray-500 resize-none h-20"
                                placeholder="Short description..."
                            />
                        </div>

                        {/* Grid */}
                        <div className="flex-grow relative p-8 min-h-[500px]">
                            {showGrid && (
                                <div className="absolute inset-0 pointer-events-none z-0">
                                    <div className="w-full h-full grid grid-cols-24 gap-[16px]" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
                                        {Array.from({ length: GRID_COLS }).map((_, i) => <div key={i} className="h-full bg-blue-50/20 border-x border-blue-50/50" />)}
                                    </div>
                                </div>
                            )}

                            <ResponsiveGridLayout
                                className="layout"
                                layouts={{ lg: blocks.map(b => b.layout) }}
                                breakpoints={breakpoints}
                                cols={cols}
                                rowHeight={GRID_ROW_HEIGHT}
                                onLayoutChange={onLayoutChange}
                                margin={[16, 16]}
                                isDraggable={true}
                                isResizable={true}
                                isDroppable={true}
                                droppingItem={{ i: 'dropping', w: 24, h: 4, x: 0, y: 0 }}
                                onDrop={(layout, item, _e) => {
                                    const e = _e as DragEvent;
                                    const type = e.dataTransfer?.getData("text/plain");
                                    if (type) {
                                        const id = `block-${Date.now()}`;
                                        let w = 24, h = 6;
                                        if (type === 'image') { w = 24; h = 10; }
                                        if (type === 'heading') { w = 24; h = 2; }
                                        setBlocks(prev => [...prev, {
                                            id, type: type as any,
                                            content: { text: 'Content...', src: '' },
                                            layout: { ...item, i: id, w, h }
                                        }]);
                                    }
                                }}
                            >
                                {blocks.map(block => (
                                    <div key={block.id} className="bg-white border hover:border-blue-500 group relative overflow-hidden">
                                        {/* Simple content render for editor */}
                                        <div className="absolute inset-0 p-2">
                                            {block.type === 'text' && (
                                                <textarea
                                                    className="w-full h-full resize-none text-xs"
                                                    value={block.content.text}
                                                    onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                                                />
                                            )}
                                            {block.type === 'image' && (
                                                <div
                                                    className="w-full h-full bg-gray-100 flex items-center justify-center relative"
                                                    onDragOver={e => e.preventDefault()}
                                                    onDrop={e => handleDropOnBlock(block.id, e)}
                                                >
                                                    {block.content.src ? (
                                                        <img src={block.content.src} className="w-full h-full object-cover" />
                                                    ) : <span className="text-xs text-gray-400">Drop Image</span>}
                                                </div>
                                            )}
                                            {/* Tools */}
                                            <button onClick={() => removeBlock(block.id)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </ResponsiveGridLayout>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RecentWorksEditor;

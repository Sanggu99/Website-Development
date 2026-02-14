import * as React from 'react';
import { useState, useEffect } from 'react';
import { contentService } from '../services/contentService';
// @ts-ignore
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import {
    Plus,
    Type,
    Image as ImageIcon,
    Layout as LayoutIcon,
    Save,
    Trash2,
    Settings,
    Grid3X3,
    MoveVertical,
    CheckCircle2,
    X,
    Maximize2,
    CheckSquare,
    AlignLeft,
    AlignJustify,
    Scan
} from 'lucide-react';
import { projectsData } from '../../data';
import { Block, LayoutItem } from '../../types';
import * as _ from 'lodash';

// Styles
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Safety check for imports
const ResponsiveGridLayout = (Responsive && WidthProvider) ? WidthProvider(Responsive) : null;

interface ThumbnailData {
    url: string;
    aspectRatio?: number;
    objectPosition?: string; // e.g., '50% 50%'
    scale?: number; // Zoom level (1.0 = cover)
}

const ThumbnailEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    data: ThumbnailData;
    onSave: (newData: ThumbnailData) => void;
}> = ({ isOpen, onClose, data, onSave }) => {
    const [scale, setScale] = useState(data.scale || 1.0);
    const [position, setPosition] = useState<{ x: number, y: number }>({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [imgDimensions, setImgDimensions] = useState({ w: 0, h: 0 });
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setScale(data.scale || 1.0);
            // Parse existing position "50% 50%"
            if (data.objectPosition) {
                const parts = data.objectPosition.split(' ');
                if (parts.length === 2) {
                    setPosition({
                        x: parseFloat(parts[0]),
                        y: parseFloat(parts[1])
                    });
                }
            } else {
                setPosition({ x: 50, y: 50 });
            }
        }
    }, [isOpen, data]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        // precise drag logic could be complex due to scaling. 
        // Simple simplified "pan" by adjusting percentage roughly.
        // Sensitivity factor
        const sensitivity = 0.2 / scale;
        const deltaX = (e.clientX - startPos.x) * sensitivity;
        const deltaY = (e.clientY - startPos.y) * sensitivity;

        setPosition(prev => ({
            x: Math.min(100, Math.max(0, prev.x - deltaX)),
            y: Math.min(100, Math.max(0, prev.y - deltaY))
        }));

        setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-[#002D57]">Edit Thumbnail View</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <div className="flex-grow bg-gray-100 relative overflow-hidden flex items-center justify-center p-8 select-none">
                    <div
                        ref={containerRef}
                        className="relative overflow-hidden shadow-2xl bg-white group cursor-move"
                        style={{
                            aspectRatio: data.aspectRatio ? `${data.aspectRatio}` : 'auto',
                            width: '100%',
                            height: 'auto',
                            maxHeight: '60vh',
                            // If no aspect defined, strict dims might be weird, but let's assume one is preferred or fall back
                            maxWidth: data.aspectRatio ? `calc(60vh * ${data.aspectRatio})` : '100%'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img
                            src={data.url}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: `${position.x}% ${position.y}%`,
                                transform: `scale(${scale})`,
                                transformOrigin: `${position.x}% ${position.y}%`
                            }}
                            draggable={false}
                            onLoad={(e) => setImgDimensions({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                        />

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 text-white text-[10px] px-2 py-1 rounded">Drag to Pan</div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-gray-100 flex items-center gap-8">
                    <div className="flex-grow">
                        <label className="text-xs font-bold text-gray-500 mb-2 block">Zoom Level: {(scale * 100).toFixed(0)}%</label>
                        <input
                            type="range"
                            min="1.0"
                            max="3.0"
                            step="0.05"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-full accent-[#002D57]"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded-lg">Cancel</button>
                        <button
                            onClick={() => {
                                onSave({
                                    ...data,
                                    scale,
                                    objectPosition: `${position.x.toFixed(1)}% ${position.y.toFixed(1)}%`
                                });
                                onClose();
                            }}
                            className="px-6 py-2 bg-[#002D57] text-white font-bold rounded-lg hover:bg-[#003d75]"
                        >
                            Save View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};



const VisualEditor: React.FC = () => {
    // Project Meta State
    const [projectTitleEn, setProjectTitleEn] = useState('PROJECT TITLE');
    const [projectTitleKo, setProjectTitleKo] = useState('프로젝트 제목');
    const [projectLocation, setProjectLocation] = useState('LOCATION, KOREA');
    const [projectYear, setProjectYear] = useState('2024');
    const [projectArea, setProjectArea] = useState('-');
    const [projectScale, setProjectScale] = useState('-');
    const [heroImage, setHeroImage] = useState('');
    const [heroPreview, setHeroPreview] = useState('');
    // New Thumbnail State
    const [thumbnailData, setThumbnailData] = useState<ThumbnailData>({ url: '' });
    const [isThumbnailEditorOpen, setIsThumbnailEditorOpen] = useState(false);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [activeBlock, setActiveBlock] = useState<string | null>(null);
    const [showGrid, setShowGrid] = useState(true);
    const [showOutlines, setShowOutlines] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // History State
    const [history, setHistory] = useState<Block[][]>([]);
    const [future, setFuture] = useState<Block[][]>([]);

    // History Helper
    const saveCheckpoint = () => {
        setHistory(prev => [...prev, blocks]);
        setFuture([]);
    };

    const undo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];

        // Save current to future
        setFuture(prev => [blocks, ...prev]);
        setBlocks(previous);
        setHistory(prev => prev.slice(0, -1));
    };

    const redo = () => {
        if (future.length === 0) return;
        const next = future[0];

        // Save current to history
        setHistory(prev => [...prev, blocks]);
        setBlocks(next);
        setFuture(prev => prev.slice(1));
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if input/textarea is focused to avoid conflict with native undo
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                if (isInput) return; // Let browser handle text undo

                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [history, future, blocks]);

    const CATEGORIES = [
        'Office',
        'Education & Research',
        'Cultural',
        'Healthcare & Mixed-use',
        'Residential & Masterplan',
        'Hotel & Resort',
        'Special',
        'Masterplan'
    ];

    // Always visible category selector
    const renderCategorySelector = () => (
        <section className="mt-8 border-t border-gray-100 pt-6">
            <label className="text-[9px] font-bold text-gray-400 uppercase mb-3 block">PROJECT CATEGORIES (USAGE)</label>
            <div className="flex flex-col gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategories(prev =>
                            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                        )}
                        className="flex items-center gap-3 w-full text-left group hover:bg-gray-50 p-2 rounded-lg -mx-2 transition-colors"
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat) ? 'bg-[#002D57] border-[#002D57]' : 'border-gray-300 bg-white group-hover:border-[#002D57]'}`}>
                            {selectedCategories.includes(cat) && <CheckSquare size={10} className="text-white" />}
                        </div>
                        <span className={`text-[11px] ${selectedCategories.includes(cat) ? 'font-bold text-[#002D57]' : 'text-gray-500'}`}>{cat}</span>
                    </button>
                ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-2 px-1">Check all applicable categories.</p>
        </section>
    );

    const FONT_SIZES = [
        { label: 'Small (12px)', value: '12px' },
        { label: 'Regular (14px)', value: '14px' },
        { label: 'Medium (16px)', value: '16px' },
        { label: 'Large (18px)', value: '18px' },
        { label: 'XL (20px)', value: '20px' },
        { label: '2XL (24px)', value: '24px' },
        { label: '3XL (30px)', value: '30px' },
        { label: '4XL (36px)', value: '36px' },
        { label: 'Display (48px)', value: '48px' },
    ];

    const FONT_WEIGHTS = [
        { label: 'Light', value: '300' },
        { label: 'Regular', value: '400' },
        { label: 'Medium', value: '500' },
        { label: 'Bold', value: '700' },
    ];

    const ALIGNMENTS = [
        { label: 'Left', value: 'left', icon: <AlignLeft size={14} /> },
        { label: 'Center', value: 'center', icon: <AlignLeft size={14} className="rotate-90" /> }, // Hack for icon, ideally use AlignCenter
        { label: 'Right', value: 'right', icon: <AlignLeft size={14} className="rotate-180" /> }, // Hack for icon
        { label: 'Justify', value: 'justify', icon: <AlignJustify size={14} /> },
    ];

    const LETTER_SPACINGS = [
        { label: 'Tight (-0.05em)', value: '-0.05em' },
        { label: 'Normal (0)', value: '0' },
        { label: 'Wide (0.05em)', value: '0.05em' },
        { label: 'Wider (0.1em)', value: '0.1em' },
    ];

    const COLORS = [
        { label: 'Black', value: '#000000', bg: 'bg-black' },
        { label: 'Gray', value: '#888888', bg: 'bg-gray-500' },
        { label: 'Navy', value: '#002D57', bg: 'bg-[#002D57]' },
        { label: 'White', value: '#FFFFFF', bg: 'bg-white border' },
    ];

    const OPACITIES = [
        { label: '100%', value: '1' },
        { label: '80%', value: '0.8' },
        { label: '60%', value: '0.6' },
        { label: '40%', value: '0.4' },
        { label: '20%', value: '0.2' },
    ];

    // UPDATED: Grid Granularity to 48 columns (Doubled)
    const GRID_COLS = 48;
    const GRID_MARGIN = 32; // 32px
    const GRID_ROW_HEIGHT = 40;

    const cols = { lg: GRID_COLS, md: 40, sm: 24, xs: 16, xxs: 8 };
    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

    useEffect(() => {
        console.log('VisualEditor Mounted');
        if (!Responsive || !WidthProvider) {
            console.error('react-grid-layout imports failed', { Responsive, WidthProvider });
            setError('Failed to load grid layout libraries. Please check console.');
        }

        // Check for existing project ID in URL
        const hash = window.location.hash;
        if (hash.startsWith('#/admin-v2/works/') && hash !== '#/admin-v2/works/new') {
            const id = parseInt(hash.split('/').pop() || '0', 10);

            // Fetch fresh data
            const currentProjects = contentService.getProjects();
            const project = currentProjects.find(p => p.id === id);

            if (project) {
                setProjectTitleEn(project.titleEn || 'Untitled');
                setProjectTitleKo(project.title || '제목 없음');
                setProjectLocation(project.location);
                setProjectYear(project.year);
                setProjectYear(project.year);
                setHeroImage(project.heroImage);

                // Initialize Thumbnail Data
                setThumbnailData({
                    url: project.thumbnailImage || '',
                    aspectRatio: project.thumbnailAspectRatio,
                    // @ts-ignore - Assuming we add these fields to project data later or reuse existing structure?
                    // Ideally, we should have a `thumbnailMeta` field, but for now let's piggyback or assume defaults.
                    // WAIT: We don't have objectPosition/scale in ProjectData yet.
                    // We need to add them. Let's assume they might exist or use defaults.
                });

                // Load Facts (Area, Scale)
                const areaFact = project.facts?.find(f => f.label === '면적' || f.label === 'Size');
                const scaleFact = project.facts?.find(f => f.label === '규모' || f.label === 'Program');
                if (areaFact) setProjectArea(areaFact.value);
                if (scaleFact) setProjectScale(scaleFact.value);

                // Parse Categories
                const cats = Array.isArray(project.category)
                    ? project.category
                    : (project.category ? [project.category] : []);
                setSelectedCategories(cats);

                // Check for existing blocks or import from details
                if (project.blocks && project.blocks.length > 0) {
                    // SCALE LEGACY BLOCKS (12 or 24 -> 48)
                    const maxW = Math.max(...project.blocks.map(b => b.layout.w));
                    let scale = 1;
                    if (maxW <= 12) scale = 4;
                    else if (maxW <= 24) scale = 2;

                    if (scale > 1) {
                        const scaledBlocks = project.blocks.map(b => ({
                            ...b,
                            layout: {
                                ...b.layout,
                                w: b.layout.w * scale,
                                x: b.layout.x * scale
                            }
                        }));
                        setBlocks(scaledBlocks);
                    } else {
                        setBlocks(project.blocks);
                    }
                } else {
                    // Import Logic: Convert legacy Description and Gallery Images to Blocks
                    const importedBlocks: Block[] = [];
                    let yCursor = 0;

                    // 1. Description (as Text Blocks)
                    if (project.description && project.description.length > 0) {
                        project.description.forEach((desc, idx) => {
                            if (desc.trim()) {
                                const id = `text-imported-${idx}`;
                                importedBlocks.push({
                                    id,
                                    type: 'text',
                                    content: { text: desc },
                                    layout: { i: id, x: 0, y: yCursor, w: 48, h: 4 } // Scale to 48
                                });
                                yCursor += 4;
                            }
                        });
                        // Add spacer after text
                        const spacerId = `spacer-after-text`;
                        importedBlocks.push({
                            id: spacerId,
                            type: 'spacer',
                            content: {},
                            layout: { i: spacerId, x: 0, y: yCursor, w: 48, h: 2 } // Scale to 48
                        });
                        yCursor += 2;
                    }

                    // 2. Gallery Images (as Image Blocks)
                    if (project.galleryImages && project.galleryImages.length > 0) {
                        project.galleryImages.forEach((img, idx) => {
                            // Determine pattern similar to Gallery.tsx
                            let pattern = 0;
                            if (img.layoutType) {
                                if (img.layoutType === 'left') pattern = 0;
                                else if (img.layoutType === 'full') pattern = 1;
                                else pattern = 2;
                            } else {
                                pattern = idx % 3;
                            }

                            const imgId = `image-imported-${idx}`;
                            const txtId = `caption-imported-${idx}`;

                            if (pattern === 0) {
                                // Pattern 0: Image Left (w=18 -> 36), Text Right (w=6 -> 12)
                                importedBlocks.push({
                                    id: imgId,
                                    type: 'image',
                                    content: { src: img.src },
                                    layout: { i: imgId, x: 0, y: yCursor, w: 36, h: 10 }
                                });
                                // Caption (Text)
                                if (img.caption) {
                                    importedBlocks.push({
                                        id: txtId,
                                        type: 'text',
                                        content: { text: img.caption, fontSize: '14px', fontWeight: '300' },
                                        layout: { i: txtId, x: 36, y: yCursor, w: 12, h: 10 }
                                    });
                                }
                                yCursor += 10;
                            } else if (pattern === 1) {
                                // Pattern 1: Full Width (w=24 -> 48)
                                importedBlocks.push({
                                    id: imgId,
                                    type: 'image',
                                    content: { src: img.src },
                                    layout: { i: imgId, x: 0, y: yCursor, w: 48, h: 14 }
                                });
                                yCursor += 14;
                                // Caption below
                                if (img.caption) {
                                    importedBlocks.push({
                                        id: txtId,
                                        type: 'text',
                                        content: { text: img.caption, fontSize: '14px', fontWeight: '300' },
                                        layout: { i: txtId, x: 0, y: yCursor, w: 48, h: 2 }
                                    });
                                    yCursor += 2;
                                }
                            } else {
                                // Pattern 2: Text Left (w=6 -> 12), Image Right (w=18 -> 36)
                                // Caption (Text)
                                if (img.caption) {
                                    importedBlocks.push({
                                        id: txtId,
                                        type: 'text',
                                        content: { text: img.caption, fontSize: '14px', fontWeight: '300' },
                                        layout: { i: txtId, x: 0, y: yCursor, w: 12, h: 10 }
                                    });
                                }
                                // Image
                                importedBlocks.push({
                                    id: imgId,
                                    type: 'image',
                                    content: { src: img.src },
                                    layout: { i: imgId, x: 12, y: yCursor, w: 36, h: 10 }
                                });
                                yCursor += 10;
                            }

                            // Add spacer
                            const spacerId = `spacer-imported-${idx}`;
                            importedBlocks.push({
                                id: spacerId,
                                type: 'spacer',
                                content: {},
                                layout: { i: spacerId, x: 0, y: yCursor, w: 48, h: 2 }
                            });
                            yCursor += 2;
                        });
                    }

                    if (importedBlocks.length > 0) {
                        setBlocks(importedBlocks);
                    }
                }
            }
        }
    }, []);

    const addBlock = (type: Block['type']) => {
        saveCheckpoint();
        const id = `block-${Date.now()}`;
        let newBlock: Block;

        const baseLayout = { i: id, x: 0, y: Infinity, w: 48, h: 4 };

        switch (type) {
            case 'text':
                newBlock = {
                    id,
                    type: 'text',
                    content: {
                        text: '여기에 내용을 입력하세요...',
                        fontSize: '14px',
                        fontWeight: '400',
                        textAlign: 'left',
                        color: '#000000',
                        opacity: '1',
                        letterSpacing: '0'
                    },
                    layout: { ...baseLayout, w: 24, h: 6 } // Half width (24/48)
                };
                break;
            case 'heading':
                newBlock = {
                    id,
                    type: 'heading',
                    content: { text: '섹션 제목', textAlign: 'left', color: '#002D57' },
                    layout: { ...baseLayout, h: 2, w: 48 }
                };
                break;
            case 'image':
                newBlock = {
                    id,
                    type: 'image',
                    content: { src: '', caption: '' },
                    layout: { ...baseLayout, w: 24, h: 10 } // Half width
                };
                break;
            case 'spacer':
                newBlock = {
                    id,
                    type: 'spacer',
                    content: {},
                    layout: { ...baseLayout, h: 2, w: 48 }
                };
                break;
            default:
                return;
        }

        setBlocks(prev => [...prev, newBlock]);
        setActiveBlock(id);
    };

    const addTemplate = (type: 'img-text' | 'text-img' | 'top-img') => {
        saveCheckpoint();
        const timestamp = Date.now();
        const y = Infinity; // Let grid layout handle placement at bottom

        let newBlocks: Block[] = [];

        if (type === 'img-text') {
            const imgId = `block-${timestamp}-img`;
            const txtId = `block-${timestamp}-txt`;

            newBlocks = [
                {
                    id: imgId,
                    type: 'image',
                    content: { src: '', caption: '' },
                    layout: { i: imgId, x: 0, y, w: 24, h: 10 }
                },
                {
                    id: txtId,
                    type: 'text',
                    content: {
                        text: '이미지에 대한 설명을 입력하세요...',
                        fontSize: '14px',
                        fontWeight: '400',
                        textAlign: 'left',
                        color: '#000000',
                        opacity: '1'
                    },
                    layout: { i: txtId, x: 24, y, w: 24, h: 10 }
                }
            ];
        } else if (type === 'text-img') {
            const txtId = `block-${timestamp}-txt`;
            const imgId = `block-${timestamp}-img`;

            newBlocks = [
                {
                    id: txtId,
                    type: 'text',
                    content: {
                        text: '이미지에 대한 설명을 입력하세요...',
                        fontSize: '14px',
                        fontWeight: '400',
                        textAlign: 'left',
                        color: '#000000',
                        opacity: '1'
                    },
                    layout: { i: txtId, x: 0, y, w: 24, h: 10 }
                },
                {
                    id: imgId,
                    type: 'image',
                    content: { src: '', caption: '' },
                    layout: { i: imgId, x: 24, y, w: 24, h: 10 }
                }
            ];
        } else if (type === 'top-img') {
            const imgId = `block-${timestamp}-img`;
            const txtId = `block-${timestamp}-txt`;

            newBlocks = [
                {
                    id: imgId,
                    type: 'image',
                    content: { src: '', caption: '' },
                    layout: { i: imgId, x: 0, y, w: 48, h: 14 }
                },
                {
                    id: txtId,
                    type: 'text',
                    content: {
                        text: '이미지 아래 설명을 입력하세요...',
                        fontSize: '14px',
                        fontWeight: '400',
                        textAlign: 'center',
                        color: '#000000',
                        opacity: '1'
                    },
                    layout: { i: txtId, x: 0, y: y + 14, w: 48, h: 4 }
                }
            ];
        }

        setBlocks(prev => [...prev, ...newBlocks]);
        // Set active to the text block for immediate editing
        if (newBlocks.length > 0) setActiveBlock(newBlocks[newBlocks.length - 1].id);
    };

    const removeBlock = (id: string) => {
        saveCheckpoint();
        setBlocks(prev => prev.filter(b => b.id !== id));
        if (activeBlock === id) setActiveBlock(null);
    };

    const onLayoutChange = (currentLayout: LayoutItem[]) => {
        setBlocks(prev => {
            const hasChanged = prev.some(block => {
                const layoutItem = currentLayout.find(l => l.i === block.id);
                return layoutItem ? { ...block, layout: layoutItem } : block;
            });

            if (!hasChanged) return prev;

            return prev.map(block => {
                const layoutItem = currentLayout.find(l => l.i === block.id);
                return layoutItem ? { ...block, layout: layoutItem } : block;
            });
        });
    };

    const updateBlockContent = (id: string, content: any, saveHistory = false) => {
        if (saveHistory) saveCheckpoint();
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...content } } : b));
    };

    const handleDropOnBlock = async (id: string, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files[0]) {
            const file = files[0];

            // Try to upload to cloud first
            try {
                // Show loading indicator in future refinement
                const publicUrl = await contentService.uploadImage(file);

                if (id === 'hero') {
                    setHeroImage(publicUrl);
                    setHeroPreview(publicUrl);
                } else if (id === 'thumbnail') {
                    setThumbnailData(prev => ({ ...prev, url: publicUrl }));
                } else {
                    updateBlockContent(id, {
                        src: publicUrl,
                        previewSrc: publicUrl
                    });
                }
            } catch (error) {
                console.error('Upload failed, falling back to local preview:', error);

                // Fallback to FileReader for local preview if upload fails (e.g. no keys)
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target?.result as string;
                    if (id === 'hero') {
                        setHeroImage(dataUrl);
                        setHeroPreview(dataUrl);
                    } else if (id === 'thumbnail') {
                        setThumbnailData(prev => ({ ...prev, url: dataUrl }));
                    } else {
                        updateBlockContent(id, {
                            src: dataUrl,
                            previewSrc: dataUrl
                        });
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const saveProject = async () => {
        setIsSaving(true);
        const isEditing = window.location.hash.startsWith('#/admin-v2/works/') && !window.location.hash.endsWith('new');
        const urlId = isEditing ? parseInt(window.location.hash.split('/').pop() || '0', 10) : undefined;

        try {
            // Helper to process image uploads for blocks
            const processedBlocks = await Promise.all(blocks.map(async (block) => {
                if (block.type === 'image' && block.content.src && block.content.src.startsWith('data:')) {
                    // It's a base64 string, need to upload
                    try {
                        const res = await fetch(block.content.src);
                        const blob = await res.blob();
                        const file = new File([blob], `block-image-${Date.now()}.jpg`, { type: blob.type });
                        const publicUrl = await contentService.uploadImage(file);
                        return {
                            ...block,
                            content: {
                                ...block.content,
                                src: publicUrl,
                                previewSrc: publicUrl
                            }
                        };
                    } catch (uploadError) {
                        console.error('Failed to upload block image:', uploadError);
                        return block; // Keep original if fail
                    }
                }
                return block;
            }));

            // Handle Hero Image if it's base64 (though usually handled by drop handler instantly)
            let finalHeroImage = heroImage;
            if (heroImage && heroImage.startsWith('data:')) {
                try {
                    const res = await fetch(heroImage);
                    const blob = await res.blob();
                    const file = new File([blob], `hero-image-${Date.now()}.jpg`, { type: blob.type });
                    finalHeroImage = await contentService.uploadImage(file);
                } catch (e) {
                    console.error('Hero upload failed', e);
                }
            }

            // Handle Thumbnail Image if it's base64
            let finalThumbnailImage = thumbnailData.url;
            if (finalThumbnailImage && finalThumbnailImage.startsWith('data:')) {
                try {
                    const res = await fetch(finalThumbnailImage);
                    const blob = await res.blob();
                    const file = new File([blob], `thumbnail-image-${Date.now()}.jpg`, { type: blob.type });
                    finalThumbnailImage = await contentService.uploadImage(file);
                } catch (e) {
                    console.error('Thumbnail upload failed', e);
                }
            }

            const projectData: any = {
                id: urlId ? urlId : (isEditing ? urlId : Date.now()),
                title: projectTitleKo,
                titleEn: projectTitleEn,
                location: projectLocation,
                year: projectYear,
                heroImage: finalHeroImage || '/projects/placeholder.jpg',
                thumbnailImage: finalThumbnailImage,
                thumbnailAspectRatio: thumbnailData.aspectRatio,
                // We're not saving position/scale to DB yet! 
                // We need to add `thumbnailMeta` or similar to ProjectData.
                // For now, let's just use what we have, but the User asked for View Setting.
                // We probably need to add `thumbnailObjectPosition` and `thumbnailScale` to ProjectData.
                // Let's add them to the payload provisionally and fixed Service later.
                // NOTE: Using 'blocks' or extra fields is better.
                // Let's store them in the project object and let `contentService` handle it (or ignore it if not mapped).
                // Actually, let's convert `thumbnailImage` to be just the URL, but we need to store the view settings.
                thumbnailObjectPosition: thumbnailData.objectPosition,
                thumbnailScale: thumbnailData.scale,
                category: selectedCategories.length > 0 ? selectedCategories : ['Uncategorized'],
                facts: [
                    { label: '면적', value: projectArea },
                    { label: '규모', value: projectScale }
                ],
                blocks: processedBlocks
            };

            await contentService.saveProject(projectData);
            alert('게시가 완료되었습니다. (저장됨)');

            // Redirect to Manager
            window.location.hash = '#/admin-v2/works';

        } catch (e: any) {
            console.error('Full Save Error:', e);
            setIsSaving(false);
            // Show more specific error
            const errorMsg = e?.message || e?.error_description || JSON.stringify(e);
            setError(`Cloud save failed: ${errorMsg}`);
            alert(`Cloud save failed! Details: ${errorMsg}`);
        }
    };

    if (error) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-red-50 text-red-600">
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Error Loading Visual Editor</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!ResponsiveGridLayout) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                    <p className="text-gray-400">Loading Grid System...</p>
                </div>
            </div>
        );
    }

    const activeBlockData = blocks.find(b => b.id === activeBlock);

    return (
        <div className="fixed inset-0 bg-[#F5F5F7] flex flex-col font-poppins selection:bg-[#002D57]/10 overflow-hidden z-[9999]" style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Control Header */}
            <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-[100] shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#002D57] rounded flex items-center justify-center text-white text-[10px] font-bold">S</div>
                        <span className="text-xs font-bold text-[#002D57] tracking-tight">VISUAL EDITOR <span className="text-[#002D57]/30 font-normal">V2</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowOutlines(!showOutlines)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-2 ${showOutlines ? 'bg-[#002D57] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        <Scan size={14} />
                        영역 표시 {showOutlines ? 'ON' : 'OFF'}
                    </button>

                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-2 ${showGrid ? 'bg-[#002D57] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        <Grid3X3 size={14} />
                        그리드 {showGrid ? '숨기기' : '표시'}
                    </button>

                    <div className="w-[1px] h-6 bg-gray-200 mx-1" />

                    <button
                        onClick={saveProject}
                        disabled={isSaving}
                        className="bg-[#002D57] text-white px-5 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-2 hover:bg-[#003d75] transition-all disabled:opacity-50"
                    >
                        {isSaving ? <MoveVertical className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                        <span>게시하기 (V2)</span>
                    </button>
                    <button
                        onClick={() => window.location.hash = '#/admin-v2'}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="닫기"
                    >
                        <X size={20} />
                    </button>
                </div>
            </header>

            <div className="flex-grow flex overflow-hidden">
                {/* Left Insert Toolbar */}
                <aside className="w-64 bg-white border-r border-gray-200 p-5 flex flex-col gap-8 overflow-y-auto no-scrollbar z-50">
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">COMPONENTS</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {/* Draggable Source Items */}
                            <div
                                draggable={true}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", "heading");
                                    e.dataTransfer.effectAllowed = "copy";
                                }}
                                onClick={() => addBlock('heading')}
                                className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-[#002D57] hover:bg-[#002D57]/5 transition-all group text-left cursor-grab active:cursor-grabbing"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#002D57] transition-colors font-bold">H</div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-700">섹션 제목</p>
                                    <p className="text-[9px] text-gray-400">Section title</p>
                                </div>
                            </div>
                            <div
                                draggable={true}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", "text");
                                    e.dataTransfer.effectAllowed = "copy";
                                }}
                                onClick={() => addBlock('text')}
                                className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-[#002D57] hover:bg-[#002D57]/5 transition-all group text-left cursor-grab active:cursor-grabbing"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#002D57] transition-colors"><Type size={16} /></div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-700">텍스트 박스</p>
                                    <p className="text-[9px] text-gray-400">Regular text bubble</p>
                                </div>
                            </div>
                            <div
                                draggable={true}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", "image");
                                    e.dataTransfer.effectAllowed = "copy";
                                }}
                                onClick={() => addBlock('image')}
                                className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-[#002D57] hover:bg-[#002D57]/5 transition-all group text-left cursor-grab active:cursor-grabbing"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#002D57] transition-colors"><ImageIcon size={16} /></div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-700">이미지</p>
                                    <p className="text-[9px] text-gray-400">Gallery image item</p>
                                </div>
                            </div>
                            <div
                                draggable={true}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", "spacer");
                                    e.dataTransfer.effectAllowed = "copy";
                                }}
                                onClick={() => addBlock('spacer')}
                                className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-[#002D57] hover:bg-[#002D57]/5 transition-all group text-left cursor-grab active:cursor-grabbing"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-[#002D57] transition-colors"><Maximize2 size={16} /></div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-700">여백</p>
                                    <p className="text-[9px] text-gray-400">Vertical spacing</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-[#F8F9FA] rounded-2xl border border-gray-100">
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                            <span className="text-[#002D57] font-bold">TIP:</span> 더 넓어진 48컬럼 그리드를 활용하세요. 템플릿을 사용하면 더 빠르게 배치할 수 있습니다.
                        </p>
                    </div>

                    {/* Template Section */}
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">QUICK TEMPLATES</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <button onClick={() => addTemplate('img-text')} className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-[#002D57] hover:bg-[#002D57]/5 transition-all text-left">
                                <div className="w-8 h-8 rounded bg-gray-50 flex gap-0.5 p-1 border border-gray-200">
                                    <div className="w-1/2 h-full bg-[#002D57]/20 rounded-sm"></div>
                                    <div className="w-1/2 h-full flex flex-col gap-0.5"><div className="w-full h-0.5 bg-gray-300"></div><div className="w-2/3 h-0.5 bg-gray-300"></div></div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-700">좌측 이미지 + 우측 텍스트</p>
                                    <p className="text-[9px] text-gray-400">Left Image / Right Text</p>
                                </div>
                            </button>
                            <button onClick={() => addTemplate('text-img')} className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-[#002D57] hover:bg-[#002D57]/5 transition-all text-left">
                                <div className="w-8 h-8 rounded bg-gray-50 flex gap-0.5 p-1 border border-gray-200">
                                    <div className="w-1/2 h-full flex flex-col gap-0.5"><div className="w-full h-0.5 bg-gray-300"></div><div className="w-2/3 h-0.5 bg-gray-300"></div></div>
                                    <div className="w-1/2 h-full bg-[#002D57]/20 rounded-sm"></div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-700">좌측 텍스트 + 우측 이미지</p>
                                    <p className="text-[9px] text-gray-400">Left Text / Right Image</p>
                                </div>
                            </button>
                            <button onClick={() => addTemplate('top-img')} className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-[#002D57] hover:bg-[#002D57]/5 transition-all text-left">
                                <div className="w-8 h-8 rounded bg-gray-50 flex flex-col gap-0.5 p-1 border border-gray-200">
                                    <div className="w-full h-2/3 bg-[#002D57]/20 rounded-sm"></div>
                                    <div className="w-full h-1/3 flex flex-col gap-0.5"><div className="w-full h-0.5 bg-gray-300"></div></div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-700">상단 이미지 + 하단 텍스트</p>
                                    <p className="text-[9px] text-gray-400">Top Image / Bottom Text</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Canvas Context (Mock Website) */}
                <main className="flex-grow relative overflow-y-auto bg-[#E5E5E7] p-8 scroll-smooth no-scrollbar">
                    <div className="max-w-[1400px] mx-auto bg-white shadow-2xl min-h-screen relative flex flex-col">

                        {/* Mock Site Header */}
                        <div className="flex-none h-16 md:h-24 px-10 md:px-24 flex items-center justify-between border-b border-gray-50">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-[#002D57]">SEOP</h2>
                            <div className="flex flex-col items-end gap-1.5 group cursor-not-allowed opacity-50">
                                <span className="w-6 h-[2px] bg-[#002D57]"></span>
                                <span className="w-8 h-[2px] bg-[#002D57]"></span>
                                <span className="w-4 h-[2px] bg-[#002D57]"></span>
                            </div>
                        </div>

                        {/* Project Top Section (Hero Mirror) */}
                        <div className="flex-none w-full border-b border-gray-100 group relative">
                            {/* Hero Image Area */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDropOnBlock('hero', e)}
                                className="w-full aspect-[16/8] md:aspect-[16/7] bg-gray-50 relative overflow-hidden cursor-pointer"
                            >
                                {heroPreview || heroImage ? (
                                    <img src={heroPreview || heroImage} className="w-full h-full object-cover" alt="Hero" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-4">
                                        <ImageIcon size={48} className="opacity-20" />
                                        <p className="text-xs font-medium tracking-widest opacity-40">DRAG & DROP THUMBNAIL IMAGE</p>
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                            </div>

                            {/* Hero Info Area */}
                            <div className="px-10 md:px-24 py-10 md:py-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 md:gap-0">
                                <div className="flex flex-col gap-4 w-full max-w-2xl">
                                    <textarea
                                        value={projectTitleEn}
                                        onChange={(e) => setProjectTitleEn(e.target.value)}
                                        placeholder="PROJECT TITLE (ENG)"
                                        rows={1}
                                        className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tighter text-[#002D57] bg-transparent focus:outline-none w-full resize-none overflow-hidden leading-normal py-4"
                                        style={{ height: 'auto', minHeight: '3em' }}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = target.scrollHeight + 'px';
                                        }}
                                    />
                                    <textarea
                                        value={projectTitleKo}
                                        onChange={(e) => setProjectTitleKo(e.target.value)}
                                        placeholder="프로젝트 제목 (국문)"
                                        rows={1}
                                        className="text-xl md:text-2xl font-bold text-gray-600 bg-transparent focus:outline-none w-full resize-none overflow-hidden leading-normal py-4"
                                        style={{ height: 'auto', minHeight: '3em' }}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = target.scrollHeight + 'px';
                                        }}
                                    />
                                    <div className="h-[1px] w-24 bg-[#002D57]/20 mt-2"></div>
                                </div>

                                <div className="flex items-center gap-12 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mb-1">LOCATION</span>
                                        <input
                                            value={projectLocation}
                                            onChange={(e) => setProjectLocation(e.target.value)}
                                            placeholder="LOCATION"
                                            className="text-[12px] md:text-sm font-bold text-[#002D57] bg-transparent focus:outline-none text-right uppercase"
                                        />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mb-1">AREA</span>
                                        <input
                                            value={projectArea}
                                            onChange={(e) => setProjectArea(e.target.value)}
                                            placeholder="AREA SQM"
                                            className="text-[12px] md:text-sm font-bold text-[#002D57] bg-transparent focus:outline-none text-right"
                                        />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mb-1">SCALE</span>
                                        <input
                                            value={projectScale}
                                            onChange={(e) => setProjectScale(e.target.value)}
                                            placeholder="SCALE"
                                            className="text-[12px] md:text-sm font-bold text-[#002D57] bg-transparent focus:outline-none text-right"
                                        />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] mb-1">YEAR</span>
                                        <input
                                            value={projectYear}
                                            onChange={(e) => setProjectYear(e.target.value)}
                                            placeholder="YYYY"
                                            className="text-[12px] md:text-sm font-bold text-[#002D57] bg-transparent focus:outline-none text-right"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail Section (For Works Index) */}
                        <div className="flex-none w-full border-b border-gray-100 group relative bg-gray-50/30">
                            <div className="px-10 md:px-24 py-8 flex flex-col md:flex-row gap-12 items-start">
                                {/* Left: Info */}
                                <div className="w-full md:w-1/3 flex flex-col gap-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#002D57] flex items-center justify-center text-white"><ImageIcon size={16} /></div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[#002D57]">PROJECT THUMBNAIL</h3>
                                            <p className="text-[10px] text-gray-400">For 'What' (Works) Index Page</p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                        This image will be displayed on the main project list. You can set a custom aspect ratio independent of the image's original size for a free-layout grid.
                                    </p>

                                    <div className="mt-4">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-2 block">ASPECT RATIO (WIDTH / HEIGHT)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={thumbnailData.aspectRatio || ''}
                                                onChange={(e) => setThumbnailData(prev => ({ ...prev, aspectRatio: e.target.value ? parseFloat(e.target.value) : undefined }))}
                                                placeholder="Auto"
                                                className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#002D57] focus:outline-none focus:border-[#002D57]"
                                            />
                                            <span className="text-xs text-gray-400">e.g. 1.0 (Square), 1.5 (3:2)</span>
                                        </div>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            <button onClick={() => setThumbnailData(prev => ({ ...prev, aspectRatio: 1.0 }))} className="px-2 py-1 bg-gray-200 rounded text-[10px] hover:bg-gray-300 transition-colors">1:1</button>
                                            <button onClick={() => setThumbnailData(prev => ({ ...prev, aspectRatio: 1.33 }))} className="px-2 py-1 bg-gray-200 rounded text-[10px] hover:bg-gray-300 transition-colors">4:3</button>
                                            <button onClick={() => setThumbnailData(prev => ({ ...prev, aspectRatio: 1.5 }))} className="px-2 py-1 bg-gray-200 rounded text-[10px] hover:bg-gray-300 transition-colors">3:2</button>
                                            <button onClick={() => setThumbnailData(prev => ({ ...prev, aspectRatio: 16 / 9 }))} className="px-2 py-1 bg-gray-200 rounded text-[10px] hover:bg-gray-300 transition-colors">16:9</button>
                                            <button onClick={() => setThumbnailData(prev => ({ ...prev, aspectRatio: 3 / 4 }))} className="px-2 py-1 bg-gray-200 rounded text-[10px] hover:bg-gray-300 transition-colors">3:4</button>
                                            <button onClick={() => setThumbnailData(prev => ({ ...prev, aspectRatio: 2 / 3 }))} className="px-2 py-1 bg-gray-200 rounded text-[10px] hover:bg-gray-300 transition-colors">2:3</button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-4 italic">Double-click image to adjusting position.</p>
                                    </div>
                                </div>

                                {/* Right: Image Drop Area */}
                                <div className="w-full md:w-2/3">
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => handleDropOnBlock('thumbnail', e)}
                                        onDoubleClick={() => thumbnailData.url && setIsThumbnailEditorOpen(true)}
                                        className="relative w-full bg-white border-2 border-dashed border-gray-200 rounded-xl overflow-hidden transition-all hover:border-[#002D57]/30 group/thumb cursor-pointer"
                                        style={{
                                            aspectRatio: thumbnailData.aspectRatio ? `${thumbnailData.aspectRatio}` : 'auto',
                                            minHeight: '300px'
                                        }}
                                        title="Double click to edit view"
                                    >
                                        {thumbnailData.url ? (
                                            <img
                                                src={thumbnailData.url}
                                                className="w-full h-full object-cover pointer-events-none"
                                                alt="Thumbnail"
                                                style={{
                                                    objectPosition: thumbnailData.objectPosition || 'center center',
                                                    transform: `scale(${thumbnailData.scale || 1})`,
                                                    transformOrigin: thumbnailData.objectPosition || 'center center'
                                                }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-4 p-12">
                                                <ImageIcon size={32} className="opacity-20" />
                                                <p className="text-[10px] font-bold tracking-widest opacity-40 uppercase text-center">Drag & Drop Thumbnail Here<br />Double Click to Adjust View</p>
                                            </div>
                                        )}

                                        {/* Overlay Actions */}
                                        {thumbnailData.url && (
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setThumbnailData(prev => ({ ...prev, url: '' }));
                                                    }}
                                                    className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ThumbnailEditorModal
                            isOpen={isThumbnailEditorOpen}
                            onClose={() => setIsThumbnailEditorOpen(false)}
                            data={thumbnailData}
                            onSave={(newData) => {
                                setThumbnailData(newData);
                                setIsThumbnailEditorOpen(false);
                            }}
                        />

                        {/* Grid Canvas Area */}
                        <div className="flex-grow relative min-h-[500px] py-16">
                            {/* Visual Grid System */}
                            {showGrid && (
                                <div className="absolute inset-0 pointer-events-none px-0 z-0">
                                    <div className={`w-full h-full grid grid-cols-24 gap-[16px] px-0`} style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
                                        {Array.from({ length: GRID_COLS }).map((_, i) => (
                                            <div key={i} className="h-full bg-[#002D57]/[0.03] border-x border-[#002D57]/[0.05]" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="px-0 relative z-10 w-full">
                                {blocks.length === 0 ? (
                                    <div className="h-48 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-300 rounded-3xl mx-6 md:mx-24 bg-gray-50/50">
                                        <Plus size={32} className="mb-4 opacity-20" />
                                        <p className="text-[11px] font-bold tracking-widest opacity-40">DRAG COMPONENTS FROM SIDEBAR HERE</p>
                                    </div>
                                ) : (
                                    <ResponsiveGridLayout
                                        className="layout"
                                        layouts={{ lg: blocks.map(b => b.layout) }}
                                        breakpoints={breakpoints}
                                        cols={cols}
                                        rowHeight={GRID_ROW_HEIGHT}
                                        onLayoutChange={onLayoutChange}
                                        margin={[16, 16]}
                                        containerPadding={[0, 0]}
                                        isDraggable={true}
                                        isResizable={true}
                                        isDroppable={true}
                                        droppingItem={{ i: 'dropping-item', w: 6, h: 4, x: 0, y: 0 }}
                                        onDrop={(layout, layoutItem, _event) => {
                                            const event = _event as DragEvent; // Type assertion
                                            const type = event.dataTransfer?.getData("text/plain") as Block['type'];
                                            if (type) {
                                                const id = `block-${Date.now()}`;
                                                let newBlock: Block;

                                                // Default dimensions based on droppingItem
                                                let w = 6;
                                                let h = 4;

                                                // Improved Smart Drop Logic
                                                // If dropping text, check if near an image to auto-size?
                                                // For now, defaulting to half-width is usually safe.

                                                // Standard defaults to prevent layout jumping
                                                if (type === 'image') { w = 24; h = 10; } // 24 = 50% of 48
                                                else if (type === 'text') { w = 24; h = 6; }
                                                else if (type === 'heading' || type === 'spacer') { w = 48; h = 2; }

                                                // If user drops text near 'x=24', they might want right column. grid-layout handles insertion point.
                                                // The 'layoutItem' prop contains the calculated position by the library.
                                                // We just need to ensure the width fits.
                                                // If x > 20 (roughly right side), try to fit in remaining space?
                                                if (layoutItem.x > 20 && w > (GRID_COLS - layoutItem.x)) {
                                                    // Auto adjust width to fit if it overflows?
                                                    // React-grid-layout handles collision, but we set initial width.
                                                }

                                                const newItem = {
                                                    ...layoutItem,
                                                    i: id,
                                                    w, h
                                                };

                                                // Create proper block structure
                                                switch (type) {
                                                    case 'text':
                                                        newBlock = { id, type: 'text', content: { text: 'Type your text...', fontSize: '14px', fontWeight: '400' }, layout: newItem };
                                                        break;
                                                    case 'heading':
                                                        newBlock = { id, type: 'heading', content: { text: 'SECTION TITLE' }, layout: { ...newItem, h: 2, w: 24 } }; // Headings usually full width
                                                        break;
                                                    case 'image':
                                                        newBlock = { id, type: 'image', content: { src: '', caption: '' }, layout: newItem };
                                                        break;
                                                    case 'spacer':
                                                        newBlock = { id, type: 'spacer', content: {}, layout: { ...newItem, h: 2, w: 24 } };
                                                        break;
                                                    default: return;
                                                }

                                                setBlocks(prev => [...prev, newBlock]);
                                                setActiveBlock(id);
                                            }
                                        }}
                                        resizeHandles={['se', 'sw']}
                                        onDragStart={() => saveCheckpoint()}
                                        onResizeStart={() => saveCheckpoint()}
                                        draggableCancel=".block-interactive-element"
                                        resizeHandle={(handleAxis, ref) => (
                                            <div
                                                ref={ref as React.RefObject<HTMLDivElement>}
                                                className={`react-resizable-handle react-resizable-handle-${handleAxis} absolute z-50`}
                                                style={{
                                                    bottom: 0,
                                                    [handleAxis === 'sw' ? 'left' : 'right']: 0,
                                                    width: '20px',
                                                    height: '20px',
                                                    cursor: handleAxis === 'sw' ? 'sw-resize' : 'se-resize',
                                                    background: 'none' // Remove default
                                                }}
                                            >
                                                {/* Custom visible handle icon */}
                                                <div className={`absolute bottom-2 ${handleAxis === 'sw' ? 'left-2 border-l-2' : 'right-2 border-r-2'} w-3 h-3 border-b-2 border-[#002D57] transition-transform hover:scale-125`} />
                                            </div>
                                        )}
                                    >
                                        {blocks.map(block => (
                                            <div
                                                key={block.id}
                                                className={`group relative flex flex-col ${activeBlock === block.id ? 'z-20' : 'z-10'} cursor-move`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveBlock(block.id);
                                                }}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => handleDropOnBlock(block.id, e)}
                                            >
                                                {/* Block UI Overlays */}
                                                {activeBlock === block.id && (
                                                    <div className="absolute -top-10 left-0 right-0 flex justify-between items-center pointer-events-none">
                                                        <div className="flex gap-2 pointer-events-auto">
                                                            <div className="bg-[#002D57] text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                                                                <Settings size={10} />
                                                                {block.type}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                                            className="pointer-events-auto p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-transform hover:scale-110 flex items-center justify-center z-50 block-interactive-element"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                )}

                                                <div
                                                    className={`w-full h-full border-2 transition-all rounded-sm overflow-hidden 
                                                        ${activeBlock === block.id ? 'border-[#002D57] bg-[#002D57]/[0.02]' : (showOutlines ? 'border-gray-200 border-dashed hover:border-gray-300' : 'border-transparent hover:border-gray-100')}
                                                    `}
                                                >
                                                    <div className="w-full h-full flex flex-col">
                                                        {block.type === 'heading' && (
                                                            <div className="p-2 w-full h-full flex items-center">
                                                                <input
                                                                    value={block.content.text}
                                                                    onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                                                                    className="block-interactive-element w-full text-xl md:text-2xl font-bold tracking-tight text-[#002D57] bg-transparent focus:outline-none uppercase"
                                                                    placeholder="SECTION HEADING"
                                                                />
                                                            </div>
                                                        )}
                                                        {block.type === 'text' && (
                                                            <div className="p-4 w-full h-full">
                                                                <textarea
                                                                    value={block.content.text || ''}
                                                                    onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                                                                    className="block-interactive-element w-full h-full bg-transparent resize-none focus:outline-none leading-relaxed font-sans placeholder-gray-300 text-gray-900"
                                                                    style={{
                                                                        fontSize: block.content.fontSize || '14px',
                                                                        fontWeight: block.content.fontWeight || '400',
                                                                        textAlign: (block.content.textAlign as any) || 'left',
                                                                        color: block.content.color || '#000000',
                                                                        opacity: block.content.opacity || '1',
                                                                        letterSpacing: block.content.letterSpacing || '0'
                                                                    }}
                                                                    placeholder="Enter description text here..."
                                                                />
                                                            </div>
                                                        )}
                                                        {block.type === 'image' && (
                                                            <div className="w-full h-full relative group/img overflow-hidden">
                                                                {block.content.previewSrc || block.content.src ? (
                                                                    <>
                                                                        <img src={block.content.previewSrc || block.content.src} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover/img:scale-105" alt="Gallery item" />
                                                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                                            <input
                                                                                value={block.content.caption}
                                                                                onChange={(e) => updateBlockContent(block.id, { caption: e.target.value })}
                                                                                className="block-interactive-element w-full bg-transparent text-[10px] text-white focus:outline-none italic placeholder:text-white/50"
                                                                                placeholder="Add caption..."
                                                                            />
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center border border-gray-100 rounded-sm p-4 text-center">
                                                                        <ImageIcon size={24} className="text-gray-200 mb-2" />
                                                                        <span className="text-[9px] font-bold text-gray-300 tracking-[0.1em]">DRAG & DROP IMAGE HERE</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {block.type === 'spacer' && (
                                                            <div className="w-full h-full flex items-center justify-center opacity-10 border border-gray-100 border-dashed rounded-lg">
                                                                <div className="h-[2px] w-1/4 bg-gray-400"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </ResponsiveGridLayout>
                                )}
                            </div>
                        </div>

                        {/* Footer Mimic */}
                        <div className="flex-none h-64 flex flex-col items-center justify-center bg-gray-50/50 border-t border-gray-50 mt-16 mt-auto">
                            <p className="text-[10px] font-bold text-gray-300 tracking-[0.5em] uppercase">END OF PROJECT</p>
                        </div>
                    </div>
                </main>

                {/* Settings Sidebar */}
                <aside className="w-72 bg-white border-l border-gray-200 flex flex-col shadow-sm select-none">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CONTENT PROPERTIES</h3>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
                        {activeBlock && activeBlockData ? (
                            <div className="space-y-8">
                                <section>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-3 block">BLOCK DETAILS</label>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[11px] font-bold text-[#002D57] uppercase">{activeBlockData.type}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">ID: {activeBlock}</p>
                                    </div>
                                </section>

                                {(activeBlockData.type === 'text' || activeBlockData.type === 'heading') && (
                                    <section>
                                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-3 block">TYPOGRAPHY</label>
                                        <div className="space-y-6">
                                            <div>
                                                <span className="text-[9px] text-gray-400 uppercase mb-2 block">Style</span>
                                                <div className="flex gap-2">
                                                    <select
                                                        value={activeBlockData.content.fontSize || '14px'}
                                                        onChange={(e) => updateBlockContent(activeBlock, { fontSize: e.target.value }, true)}
                                                        className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#002D57]"
                                                    >
                                                        {FONT_SIZES.map(s => (
                                                            <option key={s.value} value={s.value}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={activeBlockData.content.fontWeight || '400'}
                                                        onChange={(e) => updateBlockContent(activeBlock, { fontWeight: e.target.value }, true)}
                                                        className="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#002D57]"
                                                    >
                                                        {FONT_WEIGHTS.map(w => (
                                                            <option key={w.value} value={w.value}>{w.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[9px] text-gray-400 uppercase mb-2 block">Alignment</span>
                                                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
                                                    {ALIGNMENTS.map(a => (
                                                        <button
                                                            key={a.value}
                                                            onClick={() => updateBlockContent(activeBlock, { textAlign: a.value }, true)}
                                                            className={`flex-1 py-1.5 flex items-center justify-center rounded text-xs transition-all ${(activeBlockData.content.textAlign || 'left') === a.value
                                                                ? 'bg-white text-[#002D57] shadow-sm font-bold'
                                                                : 'text-gray-400 hover:text-gray-600'
                                                                }`}
                                                            title={a.label}
                                                        >
                                                            {a.label === 'Left' && <AlignLeft size={14} />}
                                                            {a.label === 'Center' && <AlignLeft size={14} className="rotate-180" />} {/* Mock center icon */}
                                                            {a.label === 'Right' && <AlignLeft size={14} className="scale-x-[-1]" />} {/* Mock right icon */}
                                                            {a.label === 'Justify' && <AlignJustify size={14} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[9px] text-gray-400 uppercase mb-2 block">Color</span>
                                                <div className="flex gap-2">
                                                    {COLORS.map(c => (
                                                        <button
                                                            key={c.value}
                                                            onClick={() => updateBlockContent(activeBlock, { color: c.value }, true)}
                                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${c.bg} ${(activeBlockData.content.color || '#000000') === c.value ? 'border-[#002D57] ring-1 ring-offset-1 ring-[#002D57]' : 'border-transparent'
                                                                }`}
                                                            title={c.label}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[9px] text-gray-400 uppercase mb-2 block">Opacity</span>
                                                <select
                                                    value={activeBlockData.content.opacity || '1'}
                                                    onChange={(e) => updateBlockContent(activeBlock, { opacity: e.target.value }, true)}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#002D57]"
                                                >
                                                    {OPACITIES.map(o => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <span className="text-[9px] text-gray-400 uppercase mb-2 block">Letter Spacing</span>
                                                <select
                                                    value={activeBlockData.content.letterSpacing || '0'}
                                                    onChange={(e) => updateBlockContent(activeBlock, { letterSpacing: e.target.value }, true)}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#002D57]"
                                                >
                                                    {LETTER_SPACINGS.map(s => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <section>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-3 block">DIMENSIONS</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center">
                                            <span className="text-[9px] text-gray-400 uppercase mb-1">Width</span>
                                            <span className="text-sm font-bold">{activeBlockData.layout.w} / {GRID_COLS}</span>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center">
                                            <span className="text-[9px] text-gray-400 uppercase mb-1">Height</span>
                                            <span className="text-sm font-bold">{activeBlockData.layout.h}</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
                                        <AlignLeft size={20} />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">SELECT A TEXT BLOCK TO EDIT TYPE PROPERTIES</p>
                                </div>
                            </div>
                        )}

                        {/* Always show categories */}
                        {renderCategorySelector()}
                    </div>
                </aside>
            </div >

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .react-grid-placeholder { background: #002D57 !important; opacity: 0.08 !important; border-radius: 4px !important; }
                .font-poppins { font-family: 'Poppins', sans-serif; }
                .font-sans { font-family: 'KoPub World Dotum', 'Inter', sans-serif; }
            `}</style>
        </div >
    );
};

export default VisualEditor;

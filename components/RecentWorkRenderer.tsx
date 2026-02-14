
import React, { useMemo } from 'react';
import { Block } from '../types';
// @ts-ignore
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = (Responsive && WidthProvider) ? WidthProvider(Responsive) : null;

interface RecentWorkRendererProps {
    blocks: Block[];
    width?: number; // Optional force width
    isMobile?: boolean; // If true, might adjust layout
}

const RecentWorkRenderer: React.FC<RecentWorkRendererProps> = ({ blocks, width }) => {
    // Shared Grid Settings to match Admin
    // Admin Editor has max-w-[1000px] with p-8 (32px*2=64px padding) -> Content Width approx 936px.
    // We use 940 as a safe round number close to that.
    const BASE_WIDTH = 940;
    const BASE_ROW_HEIGHT = 40;
    const BASE_MARGIN = 16;

    const [rowHeight, setRowHeight] = React.useState(BASE_ROW_HEIGHT);
    const [margin, setMargin] = React.useState<[number, number]>([BASE_MARGIN, BASE_MARGIN]);
    const [fontScale, setFontScale] = React.useState(1);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                const currentWidth = width || containerRef.current.offsetWidth;

                // Calculate Scale Factor
                // We want the RATIO of (ColWidth / RowHeight) to stay constant.
                // ColWidth = (ContainerWidth - Margins) / Cols

                const scale = currentWidth / BASE_WIDTH;

                // Scaled Row Height
                // We need to scale the "Total Height" of a row including margin
                // height_px = row_height * rows + margin * (rows - 1)
                // We simplify by just scaling the base row height directly for now, 
                // but margin must also scale to keep visuals consistent.

                const newRowHeight = Math.max(1, BASE_ROW_HEIGHT * scale);
                const newMargin = Math.max(0, BASE_MARGIN * scale);

                setRowHeight(newRowHeight);
                setMargin([newMargin, newMargin]);
                setFontScale(scale);
            }
        };

        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [width]);

    const renderBlock = (block: Block) => {
        const style = {
            fontSize: block.content.fontSize || '14px',
            fontWeight: block.content.fontWeight || '400',
            whiteSpace: 'pre-wrap' as const,
        };

        switch (block.type) {
            case 'heading':
                return (
                    <div className="w-full h-full flex items-center overflow-hidden">
                        <h2
                            className="font-bold text-[#002D57] uppercase whitespace-nowrap"
                            style={{
                                fontSize: `${24 * fontScale}px`, // approximate base 24px
                                lineHeight: 1.2
                            }}
                        >
                            {block.content.text}
                        </h2>
                    </div>
                );
            case 'text':
                return (
                    <div className="w-full h-full p-[2%] overflow-hidden">
                        <p
                            style={{ ...style, fontSize: `${parseFloat(block.content.fontSize || '14') * fontScale}px` }}
                            className="text-gray-700 leading-relaxed font-sans"
                        >
                            {block.content.text}
                        </p>
                    </div>
                );
            case 'image':
                return (
                    <div className="w-full h-full relative group overflow-hidden bg-gray-50">
                        <img
                            src={block.content.src || block.content.previewSrc}
                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-105"
                            alt="content"
                        />
                        {block.content.caption && (
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-black/50 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                                {block.content.caption}
                            </div>
                        )}
                    </div>
                );
            case 'spacer': return <div className="w-full h-full" />;
            default: return null;
        }
    };

    // Layout Processing
    const currentLayouts = useMemo(() => {
        if (!blocks.length) return [];
        const maxW = Math.max(...blocks.map(b => b.layout.w));
        const shouldScale = maxW <= 12;

        return blocks.map(b => ({
            ...b.layout,
            w: shouldScale ? b.layout.w * 2 : b.layout.w,
            x: shouldScale ? b.layout.x * 2 : b.layout.x,
            static: true,
            isDraggable: false,
            isResizable: false
        }));
    }, [blocks]);

    if (!ResponsiveGridLayout) return <div>Loading...</div>;

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: currentLayouts }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 24, md: 24, sm: 24, xs: 24, xxs: 24 }}
                rowHeight={rowHeight}
                margin={margin}
                containerPadding={[0, 0]}
                useCSSTransforms={true}
            >
                {blocks.map(block => (
                    <div key={block.id} className="relative overflow-hidden">
                        {renderBlock(block)}
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );
};

export default RecentWorkRenderer;

import React, { useEffect, useState, useMemo } from 'react';
import Hero from './Hero';
import Gallery from './Gallery';
import { ProjectData, Block } from '../types';
// @ts-ignore
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = (Responsive && WidthProvider) ? WidthProvider(Responsive) : null;

const renderBlock = (block: Block) => {
  const contentStyle = {
    fontSize: block.content.fontSize || '14px',
    fontWeight: block.content.fontWeight || '400',
    textAlign: block.content.textAlign || 'left',
    color: block.content.color || '#000000',
    opacity: block.content.opacity || '1',
    letterSpacing: block.content.letterSpacing || '0',
    whiteSpace: 'pre-wrap' as const,
  };

  switch (block.type) {
    case 'heading':
      return (
        <div className="w-full h-full flex items-center">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#002D57] uppercase">{block.content.text}</h2>
        </div>
      );
    case 'text':
      return (
        <div className="w-full h-full p-4">
          <p
            className="text-gray-700 leading-[1.8] font-sans"
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: block.content.text?.replace(/\n/g, '<br/>') || '' }}
          />
        </div>
      );
    case 'image':
      return (
        <div className="w-full h-full relative group overflow-hidden">
          {/* Use previewSrc if available (for newly added but unsaved images in some contexts), else src */}
          <img
            src={block.content.previewSrc || block.content.src}
            className="w-full h-full object-cover transition-all duration-[1.5s] ease-in-out group-hover:scale-105"
            alt="Gallery item"
          />
          {block.content.caption && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <p className="text-[11px] text-white font-light tracking-wide">{block.content.caption}</p>
            </div>
          )}
        </div>
      );
    case 'spacer':
      return <div className="w-full h-full" />;
    default:
      return null;
  }
};

interface ProjectViewProps {
  project: ProjectData;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project }) => {
  const [rowHeight, setRowHeight] = useState(40);

  useEffect(() => {
    // Scroll to top when project changes
    window.scrollTo(0, 0);
  }, [project.id]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Base calculation:
      // At 1400px width (design reference), rowHeight 40px looks correct.
      // Scaling factor = currentWidth / 1400.
      // e.g. 1920 / 1400 = 1.37 -> rowHeight ~55px
      // e.g. 700 / 1400 = 0.5 -> rowHeight ~20px
      const baseWidth = 1400;
      const baseRowHeight = 40;

      const newHeight = (width / baseWidth) * baseRowHeight;
      setRowHeight(Math.max(10, newHeight));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if we need to scale up layout (legacy 12/24-col to new 48-col)
  const processLayouts = (blocks: Block[]) => {
    if (!blocks || blocks.length === 0) return [];

    const maxW = Math.max(...blocks.map(b => b.layout.w));

    let scale = 1;
    if (maxW <= 12) scale = 4;       // 12 -> 48
    else if (maxW <= 24) scale = 2;  // 24 -> 48

    if (scale === 1) return blocks.map(b => ({ ...b.layout, static: true }));

    return blocks.map(b => ({
      ...b.layout,
      w: b.layout.w * scale,
      x: b.layout.x * scale,
      static: true
    }));
  };

  const currentLayouts = useMemo(() => {
    return project.blocks ? processLayouts(project.blocks) : [];
  }, [project.blocks]);

  return (
    <div className="animate-in fade-in duration-700 w-full relative">
      <div className="snap-start w-full h-[100dvh]">
        <Hero
          title={project.title}
          location={project.location}
          image={project.heroImage}
          layout={project.layout}
          facts={project.facts}
        />
      </div>

      {project.blocks && project.blocks.length > 0 && ResponsiveGridLayout ? (
        <div className="w-full bg-white min-h-screen">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: currentLayouts }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 48, md: 40, sm: 24, xs: 16, xxs: 8 }}
            rowHeight={rowHeight} // Dynamic Row Height
            margin={[16, 16]}
            containerPadding={[0, 0]}
            isDraggable={false}
            isResizable={false}
          >
            {project.blocks.map(block => (
              <div
                key={block.id}
                className="relative"
              >
                {renderBlock(block)}
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      ) : (
        <Gallery images={project.galleryImages} />
      )}
    </div>
  );
};

export default ProjectView;
import React, { useState, useMemo, useEffect } from 'react';
import { contentService } from '../src/services/contentService';
import { Filter, Check } from 'lucide-react';

interface ProjectIndexProps {
    onNavigate: (id: number) => void;
    selectedCategories?: string[];
}

const ProjectIndex: React.FC<ProjectIndexProps> = ({ onNavigate, selectedCategories = [] }) => {
    const [projects, setProjects] = useState(contentService.getProjects());
    const [numCols, setNumCols] = useState(1);

    useEffect(() => {
        const handleUpdate = () => setProjects(contentService.getProjects());
        window.addEventListener('seop_projects_updated', handleUpdate);

        const handleResize = () => {
            if (window.innerWidth >= 1024) setNumCols(3); // lg
            else if (window.innerWidth >= 768) setNumCols(2); // md
            else setNumCols(1); // sm/mobile
        };

        handleResize(); // Initial calculation
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('seop_projects_updated', handleUpdate);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const filteredProjects = useMemo(() => {
        if (selectedCategories.length === 0) return projects;
        return projects.filter(p => {
            const pCats = Array.isArray(p.category) ? p.category : [p.category || ''];
            // Robust comparison: case-insensitive and trim
            return pCats.some(c => selectedCategories.some(sc => sc.trim().toLowerCase() === c.trim().toLowerCase()));
        });
    }, [projects, selectedCategories]);

    // Distribute projects into columns for Masonry layout (Left -> Right -> Next Row)
    const distributedColumns = useMemo(() => {
        const cols: typeof projects[] = Array.from({ length: numCols }, () => []);
        filteredProjects.forEach((project, i) => {
            cols[i % numCols].push(project);
        });
        return cols;
    }, [filteredProjects, numCols]);

    return (
        <div className="pt-[80px] md:pt-[88px] px-6 md:px-12 pb-48 bg-white min-h-screen relative snap-y snap-mandatory animate-in fade-in duration-500">

            {/* Masonry Grid Container */}
            <div className="flex gap-[12px] items-start">
                {distributedColumns.map((colProjects, colIndex) => (
                    <div key={colIndex} className="flex-1 flex flex-col gap-[12px]">
                        {colProjects.map((project) => (
                            <div
                                key={project.id}
                                className="group cursor-pointer relative overflow-hidden bg-gray-100"
                                onClick={() => onNavigate(project.id)}
                            >
                                <img
                                    src={project.thumbnailImage || project.heroImage}
                                    alt={project.title}
                                    className="w-full block transition-transform duration-700 ease-out group-hover:scale-[1.03] object-cover"
                                    style={{
                                        aspectRatio: project.thumbnailAspectRatio ? `${project.thumbnailAspectRatio}` : 'auto',
                                        height: project.thumbnailAspectRatio ? 'auto' : 'auto',
                                        objectPosition: project.thumbnailObjectPosition || 'center center',
                                        // Combine custom scale with hover effect (which is handled by CSS class, but we can set base scale if needed)
                                        // Actually, CSS hover scale is applied to the image element. 
                                        // If we set `transform: scale(X)` inline, it might conflict or override the hover transition.
                                        // Strategy: The hover effect is `group-hover:scale-[1.03]`. 
                                        // If we have a custom scale (e.g. 1.5), we want to start at 1.5 and go to 1.5 * 1.03?
                                        // CSS transform replacement is tricky. 
                                        // Let's rely on a wrapper for aspect ratio/overflow, and inner image for scaling?
                                        // But the current implementation is just one img tag.
                                        // Let's just set the initial transform scale.
                                        // Wait, if I set `transform: scale(1.2)` inline, the class `group-hover:scale-[1.03]` might not work as expected because inline styles win.
                                        // Alternative: Use `zoom` (non-standard) or wrap in a div.
                                        // Let's modify the structure slightly: Wrapper (overflow hidden) -> Inner Wrapper (Scale) -> Image (Hover Scale)
                                        // Or just apply the custom scale to the image and let hover add a bit more?
                                        // Complication: standard tailwind hover transform replaces the whole transform string.

                                        // User Objective: "Set View". Usually implies cropping (object-position) and zooming (scale).
                                        // If I set `transform: scale(1.5)`, I lose the hover effect unless I re-implement it.
                                        // Let's try to just use object-position for now as it's the most critical part of "view".
                                        // Scale is tricky without breaking the simple hover animation.
                                        // Let's apply object-position only for now, as that's safe.
                                        // If scale is needed, I'll need to wrap it.
                                        // Let's try to support scale by using a wrapper div for user-defined scale.
                                    }}
                                />

                                {/* Overlay: Visible on Hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-start p-8 md:p-12 lg:p-16 backdrop-blur-[2px]">
                                    <div className="text-left">
                                        <h2
                                            className="text-white text-3xl md:text-4xl lg:text-5xl font-poppins font-medium tracking-tight capitalize mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                                            style={{ lineHeight: '1.25' }}
                                        >
                                            {project.titleEn?.toLowerCase() || project.title}
                                        </h2>
                                        <p className="text-white text-lg md:text-xl font-light tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                                            {project.title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectIndex;
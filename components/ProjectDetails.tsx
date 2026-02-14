import React from 'react';
import { ProjectFact } from '../types';

interface ProjectDetailsProps {
  title?: string;
  location?: string;
  description: string[];
  facts: ProjectFact[];
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ title, location, description, facts }) => {
  return (
    <section className="px-6 md:px-12 pt-12 md:pt-20 pb-0 bg-white">
      {/* Optional Title Header (Used for layouts where hero has no text) */}
      {title && (
        <div className="mb-16 border-b border-black pb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-black">
            {title}
          </h1>
          {location && (
            <p className="text-xl md:text-2xl font-light text-gray-500">
              {location}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left Column: Narrative */}
        <div className="md:col-span-7 lg:col-span-6">
          {description && description.length > 0 && (
            <>
              <h2 className="text-2xl md:text-3xl font-medium leading-tight mb-8">
                {description[0]?.includes('.') ? description[0].split('.')[0] + '.' : description[0]}
              </h2>
              <div className="space-y-6 text-lg font-light leading-relaxed text-gray-800">
                {description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Facts */}
        <div className="md:col-span-5 lg:col-span-4 lg:col-start-9">
          {facts && facts.length > 0 && (
            <div className="border-t border-black pt-2">
              {facts.map((fact, index) => (
                <div key={index} className="grid grid-cols-3 py-3 border-b border-gray-200 text-sm">
                  <span className="col-span-1 font-semibold text-gray-900 uppercase tracking-wide text-xs pt-1">{fact.label}</span>
                  <span className="col-span-2 text-gray-600 font-light">{fact.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectDetails;
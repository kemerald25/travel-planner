import React from 'react';
import type { ItinerarySource } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ItineraryDisplayProps {
  itinerary: string;
  sources: ItinerarySource[];
  isLoading: boolean;
  error: string | null;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, sources, isLoading, error }) => {
  
  // A simple markdown-to-HTML parser that handles headings, bold text, and lists.
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements = lines.map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-2xl font-bold mt-6 mb-3 text-cyan-300">{line.substring(4)}</h3>;
      }
      if (line.startsWith('**')) {
         // This handles "**Word:** rest of line"
        const parts = line.split('**');
        if(parts.length > 2) {
            return <p key={index} className="mb-2"><strong className="font-semibold text-slate-100">{parts[1]}</strong>{parts[2]}</p>;
        }
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-5 list-disc text-slate-300">{line.substring(2)}</li>;
      }
      if(line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2 text-slate-300">{line}</p>;
    });
    return <>{elements}</>;
  };

  const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-700 rounded w-1/3"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
      </div>
      <div className="h-8 bg-slate-700 rounded w-1/4 mt-6"></div>
       <div className="space-y-3">
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-4/6"></div>
      </div>
    </div>
  );

  const WelcomeState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <MapPinIcon className="w-24 h-24 text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-slate-400">Your Adventure Awaits</h2>
        <p className="text-slate-500 mt-2">Fill out the form to generate your personalized travel plan.</p>
    </div>
  )

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-slate-700 min-h-[600px] flex flex-col">
      <div className="prose prose-invert prose-lg max-w-none flex-grow">
        {isLoading && <SkeletonLoader />}
        {error && <p className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>}
        {!isLoading && !error && !itinerary && <WelcomeState />}
        {!isLoading && !error && itinerary && renderMarkdown(itinerary)}
      </div>

      {sources.length > 0 && !isLoading && (
         <div className="mt-8 pt-6 border-t border-slate-700">
            <h4 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Sources
            </h4>
            <ul className="space-y-2">
                {sources.map((source, index) => (
                    <li key={index}>
                        <a 
                            href={source.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors text-sm truncate"
                            title={source.web.uri}
                        >
                            {source.web.title || source.web.uri}
                        </a>
                    </li>
                ))}
            </ul>
         </div>
      )}
    </div>
  );
};

export default ItineraryDisplay;
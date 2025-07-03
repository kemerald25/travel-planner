import React, { useState, useCallback } from 'react';
import PlannerForm from './components/PlannerForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import { generateItinerary } from './services/geminiService';
import type { ItinerarySource } from './types';
import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
  const [itinerary, setItinerary] = useState<string>('');
  const [sources, setSources] = useState<ItinerarySource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanRequest = useCallback(async (destination: string, budget: string, interests: string[], duration: string) => {
    setIsLoading(true);
    setError(null);
    setItinerary('');
    setSources([]);

    try {
      const result = await generateItinerary(destination, budget, interests, duration,);
      setItinerary(result.itinerary);
      setSources(result.sources);
    } catch (err) {
      console.error(err);
      setError('Failed to generate itinerary. Please check your inputs or API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <LogoIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
              Smart Travel Planner
            </h1>
          </div>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Craft your perfect journey. Let AI build a personalized itinerary based on your destination, budget, and passions.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <PlannerForm onSubmit={handlePlanRequest} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-8">
            <ItineraryDisplay
              itinerary={itinerary}
              sources={sources}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
        <footer className="text-center mt-16 text-slate-500 text-sm">
          <p>Powered by Dev Royale. All rights reserved &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
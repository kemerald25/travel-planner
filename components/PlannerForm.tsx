import React, { useState } from 'react';
import { INTERESTS, FIAT_CURRENCIES } from '../constants';
import { getCryptoValueInUSD } from '../services/coingeckoService';
import InterestTag from './InterestTag';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import CryptoSearchDropdown from './CryptoSearchDropdown';
import type { Coin } from '../types';

interface PlannerFormProps {
  onSubmit: (destination: string, budget: string, interests: string[], duration: string) => void;
  isLoading: boolean;
}

const PlannerForm: React.FC<PlannerFormProps> = ({ onSubmit, isLoading }) => {
  const [destination, setDestination] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  // Updated state for complex budget input
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [budgetType, setBudgetType] = useState<'fiat' | 'crypto'>('fiat');
  const [fiatCurrency, setFiatCurrency] = useState<string>('USD');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [isCheckingPrice, setIsCheckingPrice] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);


  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      const newInterests = new Set(prev);
      if (newInterests.has(interest)) {
        newInterests.delete(interest);
      } else {
        newInterests.add(interest);
      }
      return newInterests;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!destination.trim()) {
      setFormError("Please fill out the destination.");
      return;
    }
    if (!duration.trim()) {
      setFormError("Please fill out the duration.");
      return;
    }

    if (!budgetAmount.trim()) {
      setFormError("Please enter a budget amount.");
      return;
    }
    
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
        setFormError("Please enter a valid, positive budget amount.");
        return;
    }

    let budgetString = '';

    if (budgetType === 'fiat') {
      budgetString = `${amount} ${fiatCurrency}`;
      onSubmit(destination, budgetString, Array.from(selectedInterests), duration);
    } else { // Crypto
      if (!selectedCoin) {
        setFormError("Please select a cryptocurrency.");
        return;
      }
      setIsCheckingPrice(true);
      try {
        const usdValue = await getCryptoValueInUSD(selectedCoin.id, amount);
        budgetString = `approx. $${usdValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD (from ${amount} ${selectedCoin.name})`;
        onSubmit(destination, budgetString, Array.from(selectedInterests), duration);
      } catch (err) {
        if (err instanceof Error) {
            setFormError(err.message);
        } else {
            setFormError("An unknown error occurred while verifying crypto price.");
        }
      } finally {
        setIsCheckingPrice(false);
      }
    }
  };

  const isSubmitDisabled = isLoading || isCheckingPrice;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700 h-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className='grid grid-cols-2 gap-3'>
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-slate-300 mb-2">
            Destination
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Tokyo, Japan"
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
            required
          />
        </div>
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-slate-300 mb-2">
            Duration
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 3"
            className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
            required
          />
        </div>
        </div>

        {/* --- Updated Budget Section --- */}
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Budget</label>
            <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setBudgetType('fiat')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${budgetType === 'fiat' ? 'bg-cyan-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>Fiat Currency</button>
                    <button type="button" onClick={() => setBudgetType('crypto')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${budgetType === 'crypto' ? 'bg-cyan-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>Cryptocurrency</button>
                </div>
                {budgetType === 'fiat' ? (
                    <div className="flex gap-2">
                        <input type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="1500" className="w-2/3 bg-slate-800 border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-1 focus:ring-cyan-400" min="0" step="any" />
                        <select value={fiatCurrency} onChange={e => setFiatCurrency(e.target.value)} className="w-1/3 bg-slate-800 border-slate-600 rounded-md px-2 py-2 text-slate-100 focus:ring-1 focus:ring-cyan-400">
                            {FIAT_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <input type="number" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} placeholder="2" className="w-full bg-slate-800 border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-1 focus:ring-cyan-400" min="0" step="any"/>
                        <CryptoSearchDropdown 
                            selectedCoin={selectedCoin}
                            onSelect={(coin) => {
                                setSelectedCoin(coin);
                                setFormError(null);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
        {/* --- End Updated Budget Section --- */}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <InterestTag
                key={interest}
                interest={interest}
                isSelected={selectedInterests.has(interest)}
                onToggle={handleInterestToggle}
              />
            ))}
          </div>
        </div>
        
        {formError && (
            <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm">
                {formError}
            </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Plan...
            </>
          ) : isCheckingPrice ? (
            <>
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying price...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="w-5 h-5" />
              Generate My Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PlannerForm;
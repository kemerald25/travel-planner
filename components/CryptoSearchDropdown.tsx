
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getCoinList } from '../services/coingeckoService';
import type { Coin } from '../types';

interface CryptoSearchDropdownProps {
  selectedCoin: Coin | null;
  onSelect: (coin: Coin) => void;
}

const CryptoSearchDropdown: React.FC<CryptoSearchDropdownProps> = ({ selectedCoin, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setIsLoading(true);
        const coinList = await getCoinList();
        setCoins(coinList);
        setError(null);
      } catch (err) {
        setError('Could not load cryptocurrencies.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoins();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCoins = useMemo(() => {
    if (!searchTerm) return coins.slice(0, 100); // Limit initial display
    const lowercasedFilter = searchTerm.toLowerCase();
    return coins.filter(coin =>
      coin.name.toLowerCase().includes(lowercasedFilter) ||
      coin.symbol.toLowerCase().includes(lowercasedFilter)
    ).slice(0, 100); // Limit results for performance
  }, [searchTerm, coins]);

  const handleSelectCoin = (coin: Coin) => {
    onSelect(coin);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus-within:ring-1 focus-within:ring-cyan-400 flex items-center justify-between cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedCoin ? (
          <span className="capitalize">{selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})</span>
        ) : (
          <span className="text-slate-400">Select a cryptocurrency...</span>
        )}
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>

      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search by name or symbol..."
              className="w-full bg-slate-900 border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:ring-1 focus:ring-cyan-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          {isLoading ? (
             <div className="p-4 text-center text-slate-400">Loading coins...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : (
            <ul>
              {filteredCoins.length > 0 ? filteredCoins.map(coin => (
                <li
                  key={coin.id}
                  className="px-4 py-2 hover:bg-cyan-600/50 cursor-pointer text-slate-300 hover:text-white"
                  onClick={() => handleSelectCoin(coin)}
                >
                  {coin.name} <span className="text-slate-400">{coin.symbol.toUpperCase()}</span>
                </li>
              )) : (
                 <li className="px-4 py-2 text-slate-400">No results found.</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CryptoSearchDropdown;

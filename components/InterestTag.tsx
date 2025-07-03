
import React from 'react';

interface InterestTagProps {
  interest: string;
  isSelected: boolean;
  onToggle: (interest: string) => void;
}

const InterestTag: React.FC<InterestTagProps> = ({ interest, isSelected, onToggle }) => {
  const baseClasses = "px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 transform hover:scale-105";
  const selectedClasses = "bg-cyan-500 text-white shadow-md";
  const unselectedClasses = "bg-slate-700 text-slate-300 hover:bg-slate-600";

  return (
    <button
      type="button"
      onClick={() => onToggle(interest)}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
    >
      {interest}
    </button>
  );
};

export default InterestTag;

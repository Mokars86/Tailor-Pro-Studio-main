import React from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  selectedArtistFilter: string;
  onArtistFilterChange: (artist: string) => void;
  artistsList: string[];
  totalResultsCount: number;
}

export const SearchBarAndFilters: React.FC<SearchBarAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  selectedArtistFilter,
  onArtistFilterChange,
  artistsList,
  totalResultsCount
}) => {
  const filterChips = [
    { id: 'all', label: 'All Clients' },
    { id: 'VIP', label: 'VIP Members' },
    { id: 'Pending Deposit', label: 'Pending Deposit' },
    { id: 'Active', label: 'Active Sessions' }
  ];

  return (
    <div className="my-5 space-y-3 font-['Outfit']">
      {/* Search Input Bar (Capsule Glassmorphism) */}
      <div className="glass-capsule rounded-full p-2 sm:p-2.5 flex items-center justify-between gap-3 shadow-md border border-white/80 dark:border-white/10 transition-all focus-within:ring-2 focus-within:ring-[#0E3832]/30 dark:focus-within:ring-amber-400/30">
        <div className="flex items-center gap-3 flex-1 pl-3">
          <Search className="w-5 h-5 text-[#0E3832] dark:text-amber-300 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search directory by client name, email, style, or artist..."
            className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-sm focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Artist Filter Dropdown */}
        <div className="hidden sm:flex items-center gap-2 pr-2 border-l border-slate-300/60 dark:border-slate-700 pl-3">
          <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-amber-300" />
          <select
            value={selectedArtistFilter}
            onChange={(e) => onArtistFilterChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer py-1 pr-1 dark:bg-[#0B2A27]"
          >
            <option value="all" className="dark:bg-[#0B2A27] dark:text-slate-200">All Artists & Mentors</option>
            {artistsList.map((artist) => (
              <option key={artist} value={artist} className="dark:bg-[#0B2A27] dark:text-slate-200">
                {artist}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Chips Row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 px-1 no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#0E3832] dark:text-amber-300" />
            Filters:
          </span>

          {filterChips.map((chip) => {
            const isActive = selectedFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => onFilterChange(chip.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? 'bg-[#0E3832] text-white border-[#0E3832] dark:bg-amber-400 dark:text-[#0D3B36] dark:border-amber-400 shadow-xs'
                    : 'bg-white/60 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-white/80 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 pl-2">
          Showing <strong className="text-slate-900 dark:text-slate-100 font-bold">{totalResultsCount}</strong> profiles
        </div>
      </div>
    </div>
  );
};

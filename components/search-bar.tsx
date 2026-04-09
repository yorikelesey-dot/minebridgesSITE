'use client';

import { Command, CommandInput } from '@/components/ui/command';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  error?: string | null;
}

export function SearchBar({ onSearch, initialValue = '', error }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [isSearching, setIsSearching] = useState(false);

  // Track when user is typing (debounce in progress)
  useEffect(() => {
    if (searchTerm !== debouncedSearch) {
      setIsSearching(true);
    }
  }, [searchTerm, debouncedSearch]);

  // Execute search when debounce completes
  useEffect(() => {
    onSearch(debouncedSearch);
    setIsSearching(false);
  }, [debouncedSearch, onSearch]);

  const handleValueChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return (
    <div className="relative w-full group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-800 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
      <Command className="relative rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.15)] [&_[cmdk-input-wrapper]]:border-none [&_[cmdk-input-wrapper]_svg]:w-6 [&_[cmdk-input-wrapper]_svg]:h-6 [&_[cmdk-input-wrapper]_svg]:text-emerald-500 [&_[cmdk-input-wrapper]_svg]:opacity-100 [&_[cmdk-input-wrapper]]:px-5">
        <CommandInput
          placeholder="Search for mods, plugins, shaders, and resource packs..."
          value={searchTerm}
          onValueChange={handleValueChange}
          className="flex-1 text-white placeholder:text-zinc-500 border-none focus:ring-0 text-lg py-6 px-3 bg-transparent h-auto outline-none w-full"
        />
      </Command>
      
      {/* Thin progress bar during debounce */}
      {isSearching && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-zinc-800/50 overflow-hidden rounded-b-xl z-10">
          <div className="h-full bg-emerald-500 animate-pulse w-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute top-full mt-2 w-full text-sm text-red-400 bg-red-950/80 backdrop-blur-md border border-red-900/50 rounded-lg px-4 py-3 shadow-lg z-20">
          {error}
        </div>
      )}
    </div>
  );
}

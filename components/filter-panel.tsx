'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterPanelProps {
  selectedCategory?: string;
  selectedSort?: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
}

const categories = [
  { value: 'mod', label: 'Mod' },
  { value: 'plugin', label: 'Plugin' },
  { value: 'shader', label: 'Shader' },
  { value: 'resourcepack', label: 'Resource Pack' },
] as const;

const sortOptions = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'latest', label: 'Latest' },
  { value: 'followed', label: 'Followed' },
] as const;

export function FilterPanel({
  selectedCategory,
  selectedSort,
  onCategoryChange,
  onSortChange,
}: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateURLParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`?${params.toString()}`);
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? '' : category;
    onCategoryChange(newCategory);
    updateURLParams('category', newCategory);
  };

  const handleSortClick = (sort: string) => {
    const newSort = selectedSort === sort ? '' : sort;
    onSortChange(newSort);
    updateURLParams('sort', newSort);
  };

  return (
    <Card className="p-6 bg-zinc-900/30 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[64px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-900/20 blur-[64px] rounded-full pointer-events-none" />
      
      <div className="space-y-8 relative z-10">
        {/* Category Filter Section */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 opacity-70" />
            Category
          </h3>
          <div className="flex flex-col gap-2.5">
            {categories.map((category) => {
              const isActive = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryClick(category.value)}
                  className={`relative w-full text-left px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-zinc-950/50 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-zinc-200 hover:border-white/10'
                  }`}
                >
                  {category.label}
                  {isActive && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 blur-[1px] shadow-[0_0_5px_rgba(16,185,129,1)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Sort Options Section */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 opacity-70" />
            Sort By
          </h3>
          <div className="flex flex-col gap-2.5">
            {sortOptions.map((option) => {
              const isActive = selectedSort === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortClick(option.value)}
                  className={`relative w-full text-left px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-zinc-950/50 text-zinc-400 border border-white/5 hover:bg-zinc-800 hover:text-zinc-200 hover:border-white/10'
                  }`}
                >
                  {option.label}
                  {isActive && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 blur-[1px] shadow-[0_0_5px_rgba(16,185,129,1)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

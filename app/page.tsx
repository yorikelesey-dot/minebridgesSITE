'use client';

import { ContentGrid } from '@/components/content-grid';
import { FilterPanel } from '@/components/filter-panel';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { errorMessages } from '@/lib/errors';
import { ContentItem } from '@/lib/types';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300000, // 5 minutes - matches search cache time
      gcTime: 600000, // 10 minutes - garbage collection time
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get state from URL query parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'popularity');
  const [selectedSource, setSelectedSource] = useState(searchParams.get('source') || 'all');
  const [isOnline, setIsOnline] = useState(true);

  // Detect online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch data using React Query
  const { data: items = [], isLoading, error } = useQuery<ContentItem[], Error>({
    queryKey: ['search', searchQuery, selectedCategory, selectedSort, selectedSource],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('query', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedSort) params.set('sort', selectedSort);
      if (selectedSource) params.set('source', selectedSource);
      
      const response = await fetch(`/api/search?${params.toString()}`, {
        cache: 'no-store' // Force fresh data, bypass cache
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error(errorMessages.RATE_LIMIT);
        } else if (response.status === 404) {
          throw new Error(errorMessages.NOT_FOUND);
        } else if (response.status >= 500) {
          throw new Error(errorMessages.SERVER_ERROR);
        } else {
          throw new Error(errorData.error || 'Failed to fetch search results');
        }
      }
      const data = await response.json();
      // API returns { results: [...], total: ..., source: ... }
      // Ensure we always return an array
      if (Array.isArray(data)) {
        return data;
      }
      return Array.isArray(data.results) ? data.results : [];
    },
    enabled: isOnline,
    retry: (failureCount, error) => {
      // Don't retry on rate limit or client errors
      if (error.message.includes('Too many requests') || error.message.includes('429')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Determine error message to display
  const errorMessage = !isOnline 
    ? errorMessages.NETWORK_ERROR 
    : error?.message || null;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSort) params.set('sort', selectedSort);
    if (selectedSource && selectedSource !== 'all') params.set('source', selectedSource);
    
    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    router.push(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, selectedSort, selectedSource, router]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white overflow-hidden selection:bg-emerald-500/30">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-900 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-700 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000" />

      {/* Navigation Bar */}
      <nav className="relative z-50 sticky top-0 border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/40 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 group cursor-default">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              MineBridges
            </h1>
            <span className="text-xs sm:text-sm font-medium text-zinc-400 opacity-0 sm:opacity-100 sm:group-hover:text-zinc-300 transition-colors">
              Ultimate Minecraft Asset Aggregator
            </span>
          </div>
          <Button
            asChild
            className="rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
          >
            <a
              href="https://t.me/MineBridges_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6"
            >
              <span>@MineBridges_bot</span>
            </a>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        {/* Search Bar - Center and pop it out */}
        <div className="mb-10 max-w-3xl mx-auto transform transition-all duration-500 hover:scale-[1.01]">
          <SearchBar
            onSearch={handleSearch}
            initialValue={searchQuery}
            error={errorMessage}
          />
        </div>

        {/* Content Area with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filter Panel Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-28 h-fit">
            <FilterPanel
              selectedCategory={selectedCategory}
              selectedSort={selectedSort}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
            />
          </aside>

          {/* Content Grid */}
          <main className="flex-1 min-w-0">
            <ContentGrid 
              items={items} 
              isLoading={isLoading} 
              error={errorMessage}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading...</p>
          </div>
        </div>
      }>
        <HomePage />
      </Suspense>
    </QueryClientProvider>
  );
}

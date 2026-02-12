'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { SearchBar } from '@/components/search-bar';
import { FilterPanel } from '@/components/filter-panel';
import { ContentGrid } from '@/components/content-grid';
import { Button } from '@/components/ui/button';
import { ContentItem } from '@/lib/types';
import { errorMessages } from '@/lib/errors';

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
      
      const response = await fetch(`/api/search?${params.toString()}`);
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
      return data.results || [];
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-white/10 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-emerald-500">MineBridges</h1>
            <span className="text-sm text-zinc-400">Ultimate Minecraft Asset Aggregator</span>
          </div>
          <Button
            asChild
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <a
              href="https://t.me/MineBridges_bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              @MineBridges_bot
            </a>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            initialValue={searchQuery}
            error={errorMessage}
          />
        </div>

        {/* Content Area with Sidebar */}
        <div className="flex gap-8">
          {/* Filter Panel Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <FilterPanel
              selectedCategory={selectedCategory}
              selectedSort={selectedSort}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
            />
          </aside>

          {/* Content Grid */}
          <main className="flex-1">
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

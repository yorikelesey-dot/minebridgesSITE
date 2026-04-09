'use client';

import { ContentCard } from '@/components/content-card';
import { SkeletonGrid } from '@/components/skeleton-grid';
import { ContentItem } from '@/lib/types';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface ContentGridProps {
  items: ContentItem[];
  isLoading: boolean;
  error?: string | null;
  onItemClick?: (item: ContentItem) => void;
}

/**
 * LazyContentCard - Wrapper component that lazy loads content cards
 * Only renders the card when it enters the viewport
 */
function LazyContentCard({ 
  item, 
  index, 
  onItemClick 
}: { 
  item: ContentItem; 
  index: number; 
  onItemClick?: (item: ContentItem) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            observer.disconnect();
          }
        });
      },
      {
        // Load items slightly before they enter viewport
        rootMargin: '100px',
        threshold: 0.01
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{ minHeight: isVisible ? 'auto' : '300px' }}
    >
      {isVisible ? (
        <ContentCard
          item={item}
          onClick={() => onItemClick?.(item)}
        />
      ) : (
        // Placeholder while loading
        <div className="h-full bg-zinc-900/50 border border-white/10 rounded-lg animate-pulse" />
      )}
    </motion.div>
  );
}

export function ContentGrid({ items, isLoading, error, onItemClick }: ContentGridProps) {
  // Display skeleton grid when loading
  if (isLoading) {
    return <SkeletonGrid />;
  }

  // Display error message if there's an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-red-400 text-lg mb-2">Error</div>
        <p className="text-zinc-400 text-sm max-w-md">
          {error}
        </p>
      </div>
    );
  }

  // Display message when no items found
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-zinc-400 text-lg mb-2">No results found</div>
        <p className="text-zinc-500 text-sm">
          Try different search terms or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <LazyContentCard
          key={`${item.source}-${item.id}`}
          item={item}
          index={index}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}

'use client';

import { ContentDescription } from '@/components/content-description';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VersionSelector } from '@/components/version-selector';
import { ContentItem } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ItemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ItemDetailData {
  item: ContentItem;
  gallery: Array<{ url: string; title?: string }>;
  body: string;
}

export default function ItemDetailPage({ params }: ItemDetailPageProps) {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') as 'modrinth' | 'curseforge' | null;
  
  const [itemId, setItemId] = useState<string>('');
  const [data, setData] = useState<ItemDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then(p => setItemId(p.id));
  }, [params]);

  useEffect(() => {
    if (!itemId) return;
    
    async function fetchItemDetail() {
      if (!source) {
        setError('Missing source parameter');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/item/${itemId}?source=${source}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch item details');
        }

        const itemData = await response.json();
        setData(itemData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchItemDetail();
  }, [itemId, source]);

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format download count
  const formatDownloads = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="h-8 w-32 bg-zinc-900 animate-pulse rounded" />
            <div className="h-32 bg-zinc-900 animate-pulse rounded-lg" />
            <div className="h-64 bg-zinc-900 animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Item</h2>
              <p className="text-zinc-300">{error || 'Item not found'}</p>
              <Link href="/">
                <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { item, gallery, body } = data;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white overflow-hidden selection:bg-emerald-500/30">
      {/* Background blobs for full page glass effect */}
      <div className="absolute top-0 -left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-[128px] animate-blob pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-emerald-900/30 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Back Button */}
          <Link href="/">
            <Button className="text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900/50 rounded-xl transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Search
            </Button>
          </Link>

          {/* Header Section */}
          <div className="bg-zinc-900/30 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              {/* Icon */}
              <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <Image
                  src={item.iconUrl}
                  alt={`${item.title} icon`}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  unoptimized={item.iconUrl.startsWith('http')}
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 mb-2 leading-tight">
                    {item.title}
                  </h1>
                  <p className="text-lg text-emerald-400 font-medium">by {item.author}</p>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-white font-bold tracking-wide">
                      {formatDownloads(item.downloadCount)}
                    </span>
                    <span className="text-zinc-400 font-medium">downloads</span>
                  </div>

                  <div className="flex items-center gap-2 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-white/5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-zinc-300 font-medium">Updated {formatDate(item.lastUpdated)}</span>
                  </div>
                </div>

                {/* Badges and Links */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize px-3 py-1 text-sm rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    {item.category}
                  </Badge>
                  
                  <Badge className="flex items-center gap-1.5 border border-white/10 bg-zinc-950/80 text-zinc-300 px-3 py-1 text-sm rounded-lg">
                    {item.source === 'modrinth' ? (
                      <>
                        <Image src="/icons/modrinth.svg" alt="Modrinth" width={16} height={16} className="text-emerald-500" />
                        <span className="font-semibold tracking-wide">Modrinth</span>
                      </>
                    ) : (
                      <>
                        <Image src="/icons/curseforge.svg" alt="CurseForge" width={16} height={16} className="text-orange-500" />
                        <span className="font-semibold tracking-wide">CurseForge</span>
                      </>
                    )}
                  </Badge>

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20"
                  >
                    <span>View on {item.source === 'modrinth' ? 'Modrinth' : 'CurseForge'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Description and Gallery */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  About Project
                </h2>
                <div className="bg-zinc-950/30 rounded-2xl p-6 border border-white/5">
                  <ContentDescription html={body} />
                </div>
              </div>

              {/* Gallery/Screenshots */}
              {gallery && gallery.length > 0 && (
                <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    Screenshots
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gallery.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-white/10 group cursor-pointer"
                      >
                        <Image
                          src={image.url}
                          alt={image.title || `Screenshot ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white font-medium bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">View larger</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Version Selector */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <VersionSelector
                  itemId={itemId}
                  source={item.source}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

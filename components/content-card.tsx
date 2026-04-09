'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ContentItem } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

interface ContentCardProps {
  item: ContentItem;
  onClick?: () => void;
}

export function ContentCard({ item, onClick }: ContentCardProps) {
  // Format download count for display (e.g., 1.2M, 45.3K)
  const formatDownloads = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link href={`/item/${item.id}?source=${item.source}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl">
      <Card
        className="relative h-full bg-zinc-900/30 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all duration-500 cursor-pointer overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col"
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500 rounded-xl" />
        <div className="p-5 flex flex-col flex-grow relative z-10">
          {/* Icon and Source Badge */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-950 border border-white/10 shadow-inner group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-500">
              <Image
                src={item.iconUrl}
                alt={`${item.title} icon`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                unoptimized={item.iconUrl.startsWith('http')}
              />
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-300">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-400 mt-1.5 font-medium flex items-center gap-1.5">
                <span className="w-4 h-px bg-zinc-600 block rounded-full" />
                {item.author}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-300 line-clamp-2 mb-6 flex-grow leading-relaxed">
            {item.description}
          </p>

          {/* Footer: Downloads and Source Badge */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-1.5 text-zinc-400 text-sm font-medium group-hover:text-zinc-300 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-emerald-500/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>{formatDownloads(item.downloadCount)}</span>
            </div>

            <Badge
              className={`flex items-center gap-1.5 border-white/10 px-2 py-0.5 transition-colors ${
                item.source === 'modrinth' ? 'bg-zinc-950/50 hover:bg-zinc-900 group-hover:border-emerald-500/30' : 'bg-zinc-950/50 hover:bg-zinc-900 group-hover:border-orange-500/30'
              }`}
            >
              {item.source === 'modrinth' ? (
                <>
                  <Image
                    src="/icons/modrinth.svg"
                    alt="Modrinth"
                    width={14}
                    height={14}
                    className="text-emerald-500 group-hover:scale-110 transition-transform"
                  />
                  <span className="font-medium tracking-wide text-xs">Modrinth</span>
                </>
              ) : (
                <>
                  <Image
                    src="/icons/curseforge.svg"
                    alt="CurseForge"
                    width={14}
                    height={14}
                    className="text-orange-500 group-hover:scale-110 transition-transform"
                  />
                  <span className="font-medium tracking-wide text-xs">CurseForge</span>
                </>
              )}
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VersionFile } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Download, ExternalLink, HardDrive } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface VersionSelectorProps {
  itemId: string;
  source: 'modrinth' | 'curseforge';
}

export function VersionSelector({ itemId, source }: VersionSelectorProps) {
  const [versions, setVersions] = useState<VersionFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedGameVersion, setSelectedGameVersion] = useState<string>('');
  const [selectedLoader, setSelectedLoader] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<VersionFile | null>(null);
  
  // Search state for versions
  const [versionSearch, setVersionSearch] = useState('');

  // Fetch versions on mount
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/versions/${itemId}?source=${source}`);
        if (!response.ok) {
          throw new Error('Failed to fetch versions');
        }
        
        const data = await response.json();
        setVersions(data.versions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [itemId, source]);

  // Get unique game versions from all version files
  const gameVersions = useMemo(() => {
    const versionSet = new Set<string>();
    versions.forEach(v => {
      v.gameVersions.forEach(gv => versionSet.add(gv));
    });
    return Array.from(versionSet).sort((a, b) => {
      return b.localeCompare(a, undefined, { numeric: true });
    });
  }, [versions]);

  // Filter versions by search query
  const filteredGameVersions = useMemo(() => {
    if (!versionSearch.trim()) return gameVersions;
    const search = versionSearch.toLowerCase();
    return gameVersions.filter(v => v.toLowerCase().includes(search));
  }, [gameVersions, versionSearch]);

  // Get available loaders for selected game version
  const availableLoaders = useMemo(() => {
    if (!selectedGameVersion) return [];
    
    const loaderSet = new Set<string>();
    versions
      .filter(v => v.gameVersions.includes(selectedGameVersion))
      .forEach(v => {
        v.loaders.forEach(l => loaderSet.add(l));
      });
    
    return Array.from(loaderSet).sort();
  }, [versions, selectedGameVersion]);

  // Find matching version file
  useEffect(() => {
    if (!selectedGameVersion || !selectedLoader) {
      setSelectedVersion(null);
      return;
    }

    const matchingVersion = versions.find(v =>
      v.gameVersions.includes(selectedGameVersion) &&
      v.loaders.includes(selectedLoader)
    );

    setSelectedVersion(matchingVersion || null);
  }, [selectedGameVersion, selectedLoader, versions]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-6 relative overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-4">Version Selection</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-6 relative overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-4">Version Selection</h3>
        <p className="text-red-400 text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-6 relative overflow-hidden">
        <h3 className="text-lg font-bold text-white mb-4">Version Selection</h3>
        <p className="text-zinc-400 text-sm font-medium">No versions available</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-[64px] rounded-full pointer-events-none" />
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        Version Selection
      </h3>
      
      <div className="space-y-6 relative z-10">
        {/* Game Version Selector with Search */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Minecraft Version
          </label>
          <input
            type="text"
            placeholder="Search versions (e.g., 1.20)..."
            value={versionSearch}
            onChange={(e) => setVersionSearch(e.target.value)}
            className="w-full px-4 py-2.5 mb-3 bg-zinc-950/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
          />
          <Select value={selectedGameVersion} onValueChange={setSelectedGameVersion}>
            <SelectTrigger className="w-full bg-zinc-950/50 border-white/10 rounded-xl py-6 hover:bg-zinc-900 transition-colors">
              <SelectValue placeholder="Select Minecraft version" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 max-h-60 rounded-xl shadow-2xl">
              {filteredGameVersions.length > 0 ? (
                filteredGameVersions.map(version => (
                  <SelectItem key={version} value={version} className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20 cursor-pointer rounded-lg my-1 transition-colors">
                    <span className="font-medium">{version}</span>
                  </SelectItem>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-zinc-400 text-sm">
                  No versions found
                </div>
              )}
            </SelectContent>
          </Select>
          {versionSearch && filteredGameVersions.length > 0 && (
            <p className="text-xs text-zinc-500 mt-2 font-medium">
              Showing {filteredGameVersions.length} of {gameVersions.length} versions
            </p>
          )}
        </div>

        {/* Loader Selector */}
        <div className="pt-2">
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Mod Loader / Core
          </label>
          <Select 
            value={selectedLoader} 
            onValueChange={setSelectedLoader}
            disabled={!selectedGameVersion}
          >
            <SelectTrigger className="w-full bg-zinc-950/50 border-white/10 rounded-xl py-6 hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:hover:bg-zinc-950/50">
              <SelectValue placeholder={selectedGameVersion ? "Select loader" : "Select version first"} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl">
              {availableLoaders.map(loader => (
                <SelectItem key={loader} value={loader} className="text-white capitalize hover:bg-emerald-500/20 focus:bg-emerald-500/20 cursor-pointer rounded-lg my-1 transition-colors">
                  <span className="font-medium">{loader}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Version Metadata - Animated Reveal */}
        <AnimatePresence mode="wait">
          {selectedVersion ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-6 p-5 bg-zinc-950/40 rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                <h4 className="font-bold text-white mb-4 text-sm sm:text-base break-words text-emerald-400/90">{selectedVersion.fileName}</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-zinc-300 font-medium bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                    <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Released: {formatDate(selectedVersion.releaseDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-zinc-300 font-medium bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                    <HardDrive className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Size: {formatFileSize(selectedVersion.fileSize)}</span>
                  </div>
                </div>

                {selectedVersion.changelog && (
                  <div className="mt-4 flex justify-end">
                    <a
                      href={selectedVersion.changelog}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1.5 transition-colors hover:underline underline-offset-4"
                    >
                      View Changelog
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <Button
                  asChild
                  className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 py-6 rounded-xl font-bold text-base hover:-translate-y-0.5"
                >
                  <a
                    href={selectedVersion.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download File
                  </a>
                </Button>
              </div>
            </motion.div>
          ) : selectedGameVersion && selectedLoader && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                <p className="text-red-400 text-sm font-medium">
                  No compatible version found for {selectedGameVersion} with {selectedLoader}.
                  Try selecting a different version or loader.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { VersionFile } from '@/lib/types';
import { Download, ExternalLink, Calendar, HardDrive } from 'lucide-react';

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
      // Sort versions in descending order (newest first)
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
      <div className="bg-zinc-900 rounded-lg p-4 sm:p-6 border border-white/10">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Version Selection</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900 rounded-lg p-4 sm:p-6 border border-white/10">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Version Selection</h3>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-lg p-4 sm:p-6 border border-white/10">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Version Selection</h3>
        <p className="text-zinc-400 text-sm">No versions available</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-4 sm:p-6 border border-white/10">
      <h3 className="text-base sm:text-lg font-semibold mb-4">Version Selection</h3>
      
      <div className="space-y-4">
        {/* Game Version Selector with Search */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Minecraft Version
          </label>
          <input
            type="text"
            placeholder="Search versions (e.g., 1.20, 1.19.4)..."
            value={versionSearch}
            onChange={(e) => setVersionSearch(e.target.value)}
            className="w-full px-3 py-2 mb-2 bg-zinc-800 border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <Select value={selectedGameVersion} onValueChange={setSelectedGameVersion}>
            <SelectTrigger className="w-full bg-zinc-800 border-white/10">
              <SelectValue placeholder="Select Minecraft version" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10 max-h-60">
              {filteredGameVersions.length > 0 ? (
                filteredGameVersions.map(version => (
                  <SelectItem key={version} value={version} className="text-white">
                    {version}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-6 text-center text-zinc-400 text-sm">
                  No versions found
                </div>
              )}
            </SelectContent>
          </Select>
          {versionSearch && filteredGameVersions.length > 0 && (
            <p className="text-xs text-zinc-500 mt-1">
              Showing {filteredGameVersions.length} of {gameVersions.length} versions
            </p>
          )}
        </div>

        {/* Loader Selector */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Mod Loader / Core
          </label>
          <Select 
            value={selectedLoader} 
            onValueChange={setSelectedLoader}
            disabled={!selectedGameVersion}
          >
            <SelectTrigger className="w-full bg-zinc-800 border-white/10">
              <SelectValue placeholder={selectedGameVersion ? "Select loader" : "Select version first"} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-white/10">
              {availableLoaders.map(loader => (
                <SelectItem key={loader} value={loader} className="text-white capitalize">
                  {loader}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Version Metadata */}
        {selectedVersion && (
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-white/10">
            <h4 className="font-medium text-white mb-3 text-sm sm:text-base break-words">{selectedVersion.fileName}</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Released: {formatDate(selectedVersion.releaseDate)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-zinc-400">
                <HardDrive className="w-4 h-4 flex-shrink-0" />
                <span>Size: {formatFileSize(selectedVersion.fileSize)}</span>
              </div>
            </div>

            {selectedVersion.changelog && (
              <div className="mt-3">
                <a
                  href={selectedVersion.changelog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                >
                  View Changelog
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <Button
              asChild
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <a
                href={selectedVersion.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </Button>
          </div>
        )}

        {/* No Compatible Version Message */}
        {selectedGameVersion && selectedLoader && !selectedVersion && (
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-yellow-500/20">
            <p className="text-yellow-400 text-sm">
              No compatible version found for {selectedGameVersion} with {selectedLoader}.
              Try selecting a different version or loader.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

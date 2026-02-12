import { NextRequest, NextResponse } from 'next/server';
import type { ContentItem } from '@/lib/types';

/**
 * Unified Search Endpoint
 * Aggregates results from both Modrinth and CurseForge APIs
 * Requirements: 1.2, 1.3, 7.3, 7.4
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const source = searchParams.get('source') || 'all';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'popularity';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const results: ContentItem[] = [];
    const errors: string[] = [];

    // Fetch from Modrinth if requested
    if (source === 'modrinth' || source === 'all') {
      try {
        const modrinthResults = await fetchModrinthResults(query, category, limit);
        results.push(...modrinthResults);
      } catch (error) {
        console.error('Modrinth fetch error:', error);
        errors.push('modrinth');
      }
    }

    // Fetch from CurseForge if requested
    if (source === 'curseforge' || source === 'all') {
      try {
        const curseforgeResults = await fetchCurseForgeResults(query, category, limit);
        results.push(...curseforgeResults);
      } catch (error) {
        console.error('CurseForge fetch error:', error);
        errors.push('curseforge');
      }
    }

    // Sort results based on sort parameter
    const sortedResults = sortResults(results, sort);

    // Limit results to requested amount
    const limitedResults = sortedResults.slice(0, limit);

    const response = NextResponse.json({
      results: limitedResults,
      total: sortedResults.length,
      source,
      errors: errors.length > 0 ? errors : undefined
    });

    // Add cache headers for client-side caching
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;

  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * Fetch results from Modrinth API
 */
async function fetchModrinthResults(
  query: string,
  category: string,
  limit: number
): Promise<ContentItem[]> {
  const modrinthUrl = new URL('https://api.modrinth.com/v2/search');
  modrinthUrl.searchParams.set('query', query);
  modrinthUrl.searchParams.set('limit', limit.toString());
  
  // Add category facet if specified
  if (category) {
    const facets = buildModrinthFacets(category);
    if (facets) {
      modrinthUrl.searchParams.set('facets', facets);
    }
  }

  const response = await fetch(modrinthUrl.toString(), {
    headers: {
      'User-Agent': 'MineBridges/1.0',
      ...(process.env.MODRINTH_API_KEY && {
        'Authorization': process.env.MODRINTH_API_KEY
      })
    },
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`Modrinth API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Transform Modrinth hits to ContentItem format
  const { transformModrinthProject } = await import('@/lib/transformers');
  const transformedResults = data.hits?.map((hit: any) => {
    return transformModrinthProject({
      source: 'modrinth',
      project_id: hit.project_id,
      title: hit.title,
      description: hit.description,
      icon_url: hit.icon_url,
      author: hit.author,
      downloads: hit.downloads,
      project_type: hit.project_type,
      date_modified: hit.date_modified,
      slug: hit.slug,
      categories: hit.categories
    });
  }) || [];
  
  return transformedResults;
}

/**
 * Fetch results from CurseForge API
 */
async function fetchCurseForgeResults(
  query: string,
  category: string,
  limit: number
): Promise<ContentItem[]> {
  const apiKey = process.env.CURSEFORGE_API_KEY;
  if (!apiKey) {
    console.warn('CurseForge API key not configured, skipping CurseForge results');
    return [];
  }

  const curseforgeUrl = new URL('https://api.curseforge.com/v1/mods/search');
  curseforgeUrl.searchParams.set('gameId', '432'); // Minecraft
  curseforgeUrl.searchParams.set('searchFilter', query);
  curseforgeUrl.searchParams.set('pageSize', limit.toString());
  
  // Add classId if category is specified
  if (category) {
    const classId = getCurseForgeClassId(category);
    if (classId) {
      curseforgeUrl.searchParams.set('classId', classId);
    }
  }

  const response = await fetch(curseforgeUrl.toString(), {
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json',
      'User-Agent': 'MineBridges/1.0'
    },
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`CurseForge API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Transform CurseForge mods to ContentItem format
  const { transformCurseForgeProject } = await import('@/lib/transformers');
  const transformedResults = data.data?.map((mod: any) => {
    return transformCurseForgeProject({
      source: 'curseforge',
      id: mod.id,
      name: mod.name,
      summary: mod.summary,
      logo: mod.logo,
      authors: mod.authors,
      downloadCount: mod.downloadCount,
      classId: mod.classId,
      dateModified: mod.dateModified,
      links: mod.links,
      categories: mod.categories
    });
  }) || [];
  
  return transformedResults;
}

/**
 * Build Modrinth facets string for category filtering
 */
function buildModrinthFacets(category: string): string | null {
  const categoryMap: Record<string, string> = {
    'mod': 'mod',
    'plugin': 'plugin',
    'shader': 'shader',
    'resourcepack': 'resourcepack'
  };

  const modrinthCategory = categoryMap[category];
  if (!modrinthCategory) return null;

  // Modrinth facets format: [["project_type:mod"]]
  return JSON.stringify([['project_type:' + modrinthCategory]]);
}

/**
 * Get CurseForge classId for category
 */
function getCurseForgeClassId(category: string): string | null {
  const classIdMap: Record<string, string> = {
    'mod': '6',
    'plugin': '5',
    'shader': '6552',
    'resourcepack': '12'
  };

  return classIdMap[category] || null;
}

/**
 * Sort results based on sort parameter
 */
function sortResults(results: ContentItem[], sort: string): ContentItem[] {
  const sorted = [...results];

  switch (sort) {
    case 'popularity':
      return sorted.sort((a, b) => b.downloadCount - a.downloadCount);
    
    case 'latest':
      return sorted.sort((a, b) => 
        b.lastUpdated.getTime() - a.lastUpdated.getTime()
      );
    
    case 'followed':
      // For now, just sort by popularity
      // In the future, this could integrate with user favorites
      return sorted.sort((a, b) => b.downloadCount - a.downloadCount);
    
    default:
      return sorted;
  }
}

/**
 * Centralized error handler for API routes
 */
function handleAPIError(error: unknown): NextResponse {
  console.error('Unified Search API Error:', error);

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'SEARCH_API_ERROR'
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    },
    { status: 500 }
  );
}

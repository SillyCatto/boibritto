'use client';

import { useEffect, useState } from 'react';
import { getRecommendations } from '@/lib/readingList';

interface GenreStat {
  genre: string;
  count: number;
}

interface StatsData {
  topGenres: GenreStat[];
  totalBooks: number;
  message?: string;
}

interface TagStat {
  tag: string;
  count: number;
  sourceGenres: string[];
}

interface GenreModalProps {
  genres: GenreStat[];
  isOpen: boolean;
  onClose: () => void;
}

interface TagModalProps {
  tags: TagStat[];
  isOpen: boolean;
  onClose: () => void;
}

function GenreModal({ genres, isOpen, onClose }: GenreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-amber-700">All Genres ({genres.length})</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="space-y-2">
            {genres.map((item, index) => (
              <div key={item.genre} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-6">{index + 1}</span>
                  <span className="text-sm text-gray-800 capitalize">{item.genre}</span>
                </div>
                <span className="text-sm text-amber-700 font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TagModal({ tags, isOpen, onClose }: TagModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-amber-700">All Reading Tags ({tags.length})</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded text-xs font-medium text-gray-600 mb-2">
            <div>Tag</div>
            <div className="text-center">Books</div>
            <div className="text-right">Rank</div>
          </div>
          
          {/* Table Rows */}
          <div className="space-y-1">
            {tags.map((item, index) => (
              <div key={item.tag} className="grid grid-cols-3 gap-2 p-2 hover:bg-gray-50 rounded">
                <div className="text-sm text-gray-800 capitalize font-medium">
                  {item.tag}
                </div>
                <div className="text-sm text-center text-amber-700 font-medium">
                  {item.count}
                </div>
                <div className="text-xs text-right text-gray-500">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenreStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getRecommendations();
        setStats(response.data);
      } catch (error: any) {
        console.error('Error fetching genre stats:', error);
        setError(error.message || 'Failed to load reading preferences');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Break down genres into small tags and count them
  const getTagStats = (): TagStat[] => {
    if (!stats?.topGenres) return [];
    
    const tagMap = new Map<string, { count: number; sourceGenres: Set<string> }>();
    
    stats.topGenres.forEach(genre => {
      // Split by common separators and clean up
      const tags = genre.genre
        .split(/[\/\-\s&,]+/)
        .filter(part => part.trim().length > 0)
        .map(part => part.trim().toLowerCase())
        .filter(part => part.length > 1); // Remove single letters
      
      tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, { count: 0, sourceGenres: new Set() });
        }
        tagMap.get(tag)!.count += genre.count;
        tagMap.get(tag)!.sourceGenres.add(genre.genre);
      });
    });
    
    return Array.from(tagMap.entries())
      .map(([tag, data]) => ({
        tag: tag.charAt(0).toUpperCase() + tag.slice(1),
        count: data.count,
        sourceGenres: Array.from(data.sourceGenres)
      }))
      .sort((a, b) => b.count - a.count);
  };

  if (isLoading) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium text-amber-700 mb-2">Reading Preferences</h3>
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm mb-1">Failed to load preferences</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || !stats.topGenres || stats.topGenres.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium text-amber-700 mb-2">Reading Preferences</h3>
        <div className="text-center py-6">
          <div className="text-3xl mb-2">📚</div>
          <p className="text-gray-500 text-sm mb-1">No reading data yet</p>
          <p className="text-xs text-gray-400">Add books to see your preferences</p>
        </div>
      </div>
    );
  }

  const tagStats = getTagStats();

  return (
    <>
      <div className="bg-white border rounded-lg">
        {/* Header */}
        <div className="p-4 border-b bg-amber-50">
          <h3 className="font-medium text-amber-700">Reading Preferences</h3>
          <p className="text-xs text-amber-600 mt-0.5">
            {stats.totalBooks} books • {tagStats.length} tags • {stats.topGenres.length} genres
          </p>
        </div>

        <div className="p-4">
          {/* Tag Stats Table - Main Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Your Reading Tags</h4>
              <button
                onClick={() => setShowTagModal(true)}
                className="text-xs text-amber-600 hover:text-amber-700 border border-amber-200 px-2 py-1 rounded"
              >
                View All {tagStats.length}
              </button>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded text-xs font-medium text-gray-600 mb-1">
              <div>Tag</div>
              <div className="text-center">Books</div>
              <div className="text-right">Rank</div>
            </div>
            
            {/* Table Rows - Show only top 5 */}
            <div className="space-y-1">
              {tagStats.slice(0, 5).map((item, index) => (
                <div key={item.tag} className="grid grid-cols-3 gap-2 p-2 hover:bg-gray-50 rounded">
                  <div className="text-sm text-gray-800 capitalize font-medium">
                    {item.tag}
                  </div>
                  <div className="text-sm text-center text-amber-700 font-medium">
                    {item.count}
                  </div>
                  <div className="text-xs text-right text-gray-500">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Show more tags if available */}
            {tagStats.length > 5 && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => setShowTagModal(true)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  +{tagStats.length - 5} more tags
                </button>
              </div>
            )}
          </div>

          {/* Full Genres Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-gray-600">Full Genre List</h4>
                <p className="text-xs text-gray-400">Complete genre data</p>
              </div>
              <button
                onClick={() => setShowGenreModal(true)}
                className="text-xs text-amber-600 hover:text-amber-700 border border-amber-200 px-2 py-1 rounded"
              >
                View All {stats.topGenres.length}
              </button>
            </div>
            
            {/* Show first 5 genres */}
            <div className="space-y-1">
              {stats.topGenres.slice(0, 5).map((item, index) => (
                <div key={item.genre} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{index + 1}</span>
                    <span className="text-sm text-gray-700 capitalize">
                      {item.genre.length > 40 ? item.genre.substring(0, 40) + '...' : item.genre}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{item.count}</span>
                </div>
              ))}
            </div>

            {stats.topGenres.length > 5 && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => setShowGenreModal(true)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  +{stats.topGenres.length - 5} more genres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for all genres */}
      <GenreModal
        genres={stats.topGenres}
        isOpen={showGenreModal}
        onClose={() => setShowGenreModal(false)}
      />

      {/* Modal for all tags */}
      <TagModal
        tags={tagStats}
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
      />
    </>
  );
}
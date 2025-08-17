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

export default function GenreStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats || !stats.topGenres || stats.topGenres.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-amber-800">Your Reading Preferences</h3>
        <div className="text-center py-8">
          <div className="text-4xl text-gray-400 mb-2">📚</div>
          <p className="text-gray-500 mb-1">No genre data yet</p>
          <p className="text-sm text-gray-400">
            Add books to your reading list to see your favorite genres!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-amber-800">Your Reading Preferences</h3>
      
      <div className="space-y-3 mb-4">
        {stats.topGenres.map((item, index) => (
          <div key={item.genre} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-amber-600 w-4">#{index + 1}</span>
              <span className="font-medium capitalize text-gray-700">{item.genre}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(item.count / stats.topGenres[0].count) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-amber-700 w-8">
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t text-sm text-amber-600 mt-4">
        <span>Total Books: {stats.totalBooks}</span>
      </div>
    </div>
  );
}
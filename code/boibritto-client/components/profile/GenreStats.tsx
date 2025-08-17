// filepath: components/profile/GenreStats.tsx
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

export default function GenreStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getRecommendations();
        setStats(data);
      } catch (error) {
        console.error('Error fetching genre stats:', error);
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
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/googleAuth";
import { discussionsAPI, Discussion } from "@/lib/discussionAPI";
import { GENRES } from "@/lib/constants";

// Filter options - using the same genres from constants
const GENRE_FILTERS = ["All", ...GENRES.map(genre => genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' '))];

export default function DiscussionsPage() {
  const [user] = useAuthState(auth);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Load discussions
  useEffect(() => {
    const loadDiscussions = async () => {
      try {
        setLoading(true);
        const params: { search?: string } = {};
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        const response = await discussionsAPI.getDiscussions(params);
        setDiscussions(response.discussions);
      } catch (err) {
        console.error("Failed to load discussions:", err);
        setError("Failed to load discussions");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDiscussions();
    }
  }, [user, searchQuery]);

  // Filter discussions based on genre
  const filteredDiscussions = discussions.filter(discussion => {
    const matchesGenre = activeFilter === "All" || 
      (discussion.genres && discussion.genres.some(genre => 
        genre.toLowerCase() === activeFilter.toLowerCase().replace(' ', '-')
      ));
    
    return matchesGenre;
  });

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the search when searchQuery changes
  };

  // Function to format plain text content with line breaks
  const formatContent = (content: string | undefined | null) => {
    if (!content) return null;
    return content.split('\n').map((paragraph, i) => (
      <p key={i} className="mb-2">
        {paragraph.startsWith('- ') ? (
          <span className="flex">
            <span className="mr-2">•</span>
            {paragraph.substring(2)}
          </span>
        ) : (
          paragraph
        )}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-amber-700 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Discussions</h1>
          <p className="text-amber-100 max-w-2xl mb-8">
            Join the conversation about books, authors, and reading. Share your thoughts 
            and connect with other readers.
          </p>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="relative max-w-md">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-gray-800 bg-white 
              focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
              strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" 
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Recent Discussions</h2>
          <p className="text-gray-500 text-sm mt-1">Join the conversation or start your own</p>
        </div>
        
        {user && (
          <Link href="/discussions/create" className="bg-amber-700 hover:bg-amber-800 text-white 
          px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Start New Discussion
          </Link>
        )}
      </div>
      
      {/* Genre filters */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white shadow-sm rounded-lg p-2 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {GENRE_FILTERS.map((genre) => (
              <button
                key={genre}
                onClick={() => setActiveFilter(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === genre
                    ? "bg-amber-100 text-amber-800"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Discussions list */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {!user ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Sign in to view discussions</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Join our community to participate in book discussions and share your thoughts with other readers.
            </p>
            <Link href="/signin" className="text-amber-700 hover:text-amber-800 font-medium">
              Sign in to continue →
            </Link>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading discussions...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-red-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" 
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Error loading discussions</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-amber-700 hover:text-amber-800 font-medium"
            >
              Try again →
            </button>
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" 
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No discussions found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery ? 
                "Try adjusting your search or filters, or start a new discussion to get the conversation going." :
                "Be the first to start a discussion about books and reading!"
              }
            </p>
            <div className="mt-6">
              <Link href="/discussions/create" className="text-amber-700 hover:text-amber-800 font-medium">
                Start a new discussion →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDiscussions.map((discussion) => (
              <Link 
                href={`/discussions/${discussion._id}`} 
                key={discussion._id}
                className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden mr-4">
                        {discussion.user?.avatar ? (
                          <Image 
                            src={discussion.user.avatar} 
                            alt={discussion.user?.displayName || 'User'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-amber-200 flex items-center justify-center">
                            <span className="text-amber-800 font-semibold text-sm">
                              {(discussion.user?.displayName || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{discussion.user?.displayName || 'Unknown User'}</h3>
                        <p className="text-gray-500 text-sm">@{discussion.user?.username || 'unknown'}</p>   
            
                        <p className="text-gray-400 text-xs mt-1">
                          {discussion.createdAt ? new Date(discussion.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          }) : 'Unknown date'} 
                        </p>
                      </div>
                    </div>
                    
                    {discussion.spoilerAlert && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Spoiler Alert
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-800 mt-4 mb-2">{discussion.title || 'Untitled Discussion'}</h2>
                  
                  <div className="text-gray-600 mt-2 line-clamp-3">
                    {formatContent(discussion.content)}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(discussion.genres || []).map((genre) => (
                        <span 
                          key={`${discussion._id}-${genre}`}
                          className="bg-amber-50 text-amber-800 text-xs px-2.5 py-0.5 rounded"
                        >
                          {genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-gray-500">
                      <span className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                        strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                        </svg>
                        <span>Comments coming soon</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      <div className="max-w-7xl mx-auto px-6 mt-8 flex justify-center">
        <div className="flex items-center space-x-1">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">Page 1 of 1</span>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
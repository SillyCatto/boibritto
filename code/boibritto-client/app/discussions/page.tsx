"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";



// Types
interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
}

interface Discussion {
  _id: string;
  user: User;
  title: string;
  content: string;
  visibility: "private" | "friends" | "public";
  spoilerAlert: boolean;
  genres: string[];
  createdAt: string;
  updatedAt: string;
}

// Dummy data matching the provided format
const DUMMY_DISCUSSIONS: Discussion[] = [
  {
    _id: "6847133861841477d982ac22",
    user: {
      _id: "6843292c5cc2e9ee0b9bc0a9",
      username: "test",
      displayName: "TestUser",
      avatar: "https://ui-avatars.com/api/?name=Test+User&background=random"
    },
    title: "Best Fantasy Novels of 2024",
    content: "My Top Picks\n\nThe Starless Crown by James Rollins is fantastic!\n\nOther recommendations:\n- The Atlas Six by Olivie Blake\n- Book of Night by Holly Black\n- Nettle & Bone by T. Kingfisher",
    visibility: "public",
    spoilerAlert: false,
    genres: ["fantasy", "fiction"],
    createdAt: "2025-06-09T17:00:40.091Z",
    updatedAt: "2025-06-09T17:00:40.091Z"
  },
  {
    _id: "68470ca92df9925ccd743b78",
    user: {
      _id: "6843292c5cc2e9ee0b9bc0a9",
      username: "bibliophile",
      displayName: "Book Lover",
      avatar: "https://ui-avatars.com/api/?name=Book+Lover&background=amber"
    },
    title: "The Ending of 'The Silent Patient' - My Thoughts",
    content: "Wow, that twist!\n\nI never saw it coming!\n\nThoughts on the ending:\n- The unreliable narrator technique was masterfully done\n- The psychological aspects were well-researched\n- The final reveal changed everything",
    visibility: "public",
    spoilerAlert: true,
    genres: ["thriller", "mystery"],
    createdAt: "2025-06-09T16:32:41.983Z",
    updatedAt: "2025-06-09T16:32:41.983Z"
  },
  {
    _id: "68470ca92df9925ccd743b79",
    user: {
      _id: "6843292c5cc2e9ee0b9bc0a8",
      username: "litcritic",
      displayName: "Literary Critic",
      avatar: "https://ui-avatars.com/api/?name=Literary+Critic&background=purple"
    },
    title: "Is Classic Literature Still Relevant Today?",
    content: "The importance of classics\n\nI believe classic literature continues to be relevant because:\n1. It offers timeless insights into human nature\n2. It provides historical context to modern issues\n3. The writing quality often surpasses modern works\n\nWhat do you think? Are classics still worth reading?",
    visibility: "public",
    spoilerAlert: false,
    genres: ["classic", "literature"],
    createdAt: "2025-06-08T13:24:11.983Z",
    updatedAt: "2025-06-08T14:15:22.983Z"
  },
  {
    _id: "68470ca92df9925ccd743b80",
    user: {
      _id: "6843292c5cc2e9ee0b9bc0a7",
      username: "scififan",
      displayName: "SciFi Enthusiast",
      avatar: "https://ui-avatars.com/api/?name=SciFi+Enthusiast&background=blue"
    },
    title: "The Future of AI in Sci-Fi vs Reality",
    content: "Fiction becoming reality\n\nI've been comparing sci-fi predictions about AI from the past few decades with what we're actually seeing today.\n\nKey observations:\n- Many authors predicted superintelligence but missed the importance of data\n- Few predicted the ethical challenges we're facing\n- The concept of AI companions is evolving differently than in fiction",
    visibility: "public",
    spoilerAlert: false,
    genres: ["sci-fi", "technology"],
    createdAt: "2025-06-07T09:14:30.983Z",
    updatedAt: "2025-06-07T09:14:30.983Z"
  }
];

// Filter options
const GENRE_FILTERS = ["All", "Fiction", "Non-fiction", "Fantasy", "Sci-fi", "Mystery", "Classic", "Literature", "Thriller"];

export default function DiscussionsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter discussions based on genre and search query
  const filteredDiscussions = DUMMY_DISCUSSIONS.filter(discussion => {
    const matchesGenre = activeFilter === "All" || 
      discussion.genres.some(genre => genre.toLowerCase() === activeFilter.toLowerCase());
    
    const matchesSearch = searchQuery === "" || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesGenre && matchesSearch;
  });

  // Function to format plain text content with line breaks
  const formatContent = (content: string) => {
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
          
          {/* Search input */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-gray-800 bg-white 
              focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
            />
            <span className="absolute right-3 top-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
              strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" 
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Recent Discussions</h2>
          <p className="text-gray-500 text-sm mt-1">Join the conversation or start your own</p>
        </div>
        
        <Link href="/discussions/new" className="bg-amber-700 hover:bg-amber-800 text-white 
        px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
          strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Start New Discussion
        </Link>
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
        {filteredDiscussions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" 
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No discussions found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search or filters, or start a new discussion to get the conversation going.
            </p>
            <div className="mt-6">
              <Link href="/discussions/new" className="text-amber-700 hover:text-amber-800 font-medium">
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
                        <Image 
                          src={discussion.user.avatar} 
                          alt={discussion.user.displayName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{discussion.user.displayName}</h3>
                        <p className="text-gray-500 text-sm">@{discussion.user.username}</p>   
            
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(discussion.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })} 
                        </p>
                      </div>
                    </div>
                    
                    {discussion.spoilerAlert && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Spoiler Alert
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-800 mt-4 mb-2">{discussion.title}</h2>
                  
                  <div className="text-gray-600 mt-2 line-clamp-3">
                    {formatContent(discussion.content)}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {discussion.genres.map((genre) => (
                        <span 
                          key={`${discussion._id}-${genre}`}
                          className="bg-amber-50 text-amber-800 text-xs px-2.5 py-0.5 rounded"
                        >
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
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
                        <span>{Math.floor(Math.random() * 15)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                        strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <span>{Math.floor(Math.random() * 30)}</span>
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
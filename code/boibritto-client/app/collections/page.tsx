"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
}

interface Collection {
  _id: string;
  user: User;
  title: string;
  description: string;
  books: string[];
  tags: string[];
  visibility: "public" | "private" | "friends";
  createdAt: string;
  updatedAt: string;
}

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/signin");
        return;
      }

      try {
        setLoading(true);
        const token = await user.getIdToken();
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections?owner=me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          }
        );

        if (response.data.success) {
          setCollections(response.data.data.collections || []);
        } else {
          setError(response.data.message || "Failed to load collections");
        }
      } catch (error: any) {
        console.error("Error fetching collections:", error);
        setError(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get visibility badge
  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Public</span>;
      case "private":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Private</span>;
      case "friends":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Friends</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => router.push("/explore")}
          className="px-4 py-2 bg-amber-700 text-white rounded-md"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
          <button 
            className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
            // This button would open a modal to create new collection
            // For now it's just UI
          >
            Create Collection
          </button>
        </div>
        
        {collections.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">You haven't created any collections yet.</p>
            <button 
              className="inline-block px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
              // Would open collection creation modal
            >
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {collections.map((collection) => (
              <div key={collection._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {collection.title}
                      </h2>
                    </div>
                    {getVisibilityBadge(collection.visibility)}
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {collection.description || "No description"}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                    <div>
                      <span>{collection.books.length} {collection.books.length === 1 ? 'book' : 'books'}</span>
                      <span className="mx-2">•</span>
                      <span>Created on {formatDate(collection.createdAt)}</span>
                    </div>
                    
                    <div>
                      {collection.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {collection.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <Link
                      href={`/collections/${collection._id}`}
                      className="text-amber-700 hover:text-amber-800 text-sm font-medium"
                    >
                      View Collection
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
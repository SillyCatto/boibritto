"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";
import Image from "next/image";
import Link from "next/link";

// Initialize Firebase
initFirebase();

interface Collection {
  _id: string;
  title: string;
  description: string;
  visibility: string;
  books: Array<{
    volumeId: string;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function MyCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    visibility: "public" as "public" | "private" | "friends"
  });

  useEffect(() => {
    const fetchMyCollections = async () => {
      setLoading(true);
      setError("");

      try {
        const auth = getAuth();

        if (!auth.currentUser) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const token = await auth.currentUser.getIdToken();

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections?owner=me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        const { data } = response;

        if (data.success) {
          setCollections(data.data.collections || []);
        } else {
          setError(data.message || "Failed to load collections");
        }
      } catch (error: unknown) {
        console.error("Failed to load collections:", error);
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          "Failed to load collections";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchMyCollections();
      } else {
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.title.trim()) {
      alert("Please enter a title for your collection");
      return;
    }

    setCreateLoading(true);

    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        setError("User not authenticated");
        return;
      }

      const token = await auth.currentUser.getIdToken();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections`,
        {
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          visibility: createForm.visibility,
          books: []
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Add the new collection to the list
        setCollections(prev => [response.data.data.collection, ...prev]);

        // Reset form and close modal
        setCreateForm({
          title: "",
          description: "",
          visibility: "public"
        });
        setShowCreateModal(false);

        // Show success message
        alert("Collection created successfully!");
      } else {
        alert(response.data.message || "Failed to create collection");
      }
    } catch (error: unknown) {
      console.error("Failed to create collection:", error);
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to create collection";
      alert(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      title: "",
      description: "",
      visibility: "public"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-lg"
          onClick={() => router.push("/signin")}
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <main className="bg-white text-gray-900 py-16 px-6 sm:px-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
          <Link
            href="/profile"
            className="text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Profile
          </Link>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New Collection
          </button>
        </div>

        {collections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection._id}
                href={`/collections/${collection._id}`}
                className="block border border-gray-200 rounded-xl p-6 bg-white hover:bg-amber-50 hover:border-amber-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-amber-700 line-clamp-2">
                    {collection.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    collection.visibility === 'public'
                      ? 'bg-green-100 text-green-700'
                      : collection.visibility === 'private'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {collection.visibility}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {collection.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 1 18 18a8.967 8.967 0 0 1-6 2.292m0-14.25v14.25" />
                    </svg>
                    {collection.books?.length || 0} book{collection.books?.length !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {new Date(collection.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-amber-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 1 18 18a8.967 8.967 0 0 1-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Collections Yet</h3>
            <p className="text-gray-500 mb-6">Start building your book collections by adding books you love!</p>
            <Link
              href="/explore"
              className="inline-flex items-center px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
            >
              Explore Books
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Collection</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Collection Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter collection title"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Describe your collection (optional)"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    value={createForm.visibility}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, visibility: e.target.value as "public" | "private" | "friends" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || !createForm.title.trim()}
                    className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {createLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      "Create Collection"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

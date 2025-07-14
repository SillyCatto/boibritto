"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/googleAuth";
import { fetchBookDetails } from "@/lib/googleBooks";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface BookInfo {
  volumeId: string;
  _id: string;
  addedAt: string;
}

interface Collection {
  _id: string;
  title: string;
  description: string;
  books: BookInfo[];
  visibility: string;
  user: {
    _id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
}

export default function CollectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bookDetails, setBookDetails] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{ volumeId: string; title: string } | null>(null);
  const [showDeleteCollectionModal, setShowDeleteCollectionModal] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check if current user is the owner of the collection
  const isOwner = currentUser && collection && collection.user._id === currentUser._id;

  // Check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthInitialized(true);
      if (!user) {
        console.log("User not authenticated, redirecting to signin");
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchCollection = async () => {
      // Wait for auth to initialize before making API calls
      if (!authInitialized) return;

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          console.error("No authentication token available");
          router.push("/signin");
          return;
        }

        console.log("Fetching collection with token:", token.substring(0, 20) + "...");

        // Fetch both collection and current user profile
        const [collectionRes, profileRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })
        ]);

        if (collectionRes.data.success) {
          setCollection(collectionRes.data.data.collection);
          setTitle(collectionRes.data.data.collection.title);
          setDescription(collectionRes.data.data.collection.description);
        }

        if (profileRes.data.success) {
          setCurrentUser(profileRes.data.data.profile_data);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch collection:", err);
        if (err.response?.status === 401) {
          console.error("Authentication failed - redirecting to signin");
          router.push("/signin");
        }
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id, router, authInitialized]);

  useEffect(() => {
    const loadBooks = async () => {
      if (!collection) return;
      const details = await Promise.all(
        collection.books.map((b) => fetchBookDetails(b.volumeId))
      );
      setBookDetails(details);
    };

    loadBooks();
  }, [collection]);


  const handleDeleteBook = async (volumeId: string) => {
    if (!collection) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.error("No authentication token available");
        router.push("/signin");
        return;
      }

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections/${collection._id}`,
        { data: { removeBook: volumeId } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const json = res.data;
      if (json.success) {
        setCollection(json.data.collection);
        setShowDeleteModal(false);
        setBookToDelete(null);
      }
    } catch (err: any) {
      console.error("Failed to remove book:", err);
      if (err.response?.status === 401) {
        console.error("Authentication failed - redirecting to signin");
        router.push("/signin");
      }
    }
  };

  const openDeleteModal = (volumeId: string, title: string) => {
    setBookToDelete({ volumeId, title });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setBookToDelete(null);
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.error("No authentication token available");
        router.push("/signin");
        return;
      }

      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections/${collection._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setShowDeleteCollectionModal(false);
      router.push("/profile");
    } catch (err: any) {
      console.error("Failed to delete collection:", err);
      if (err.response?.status === 401) {
        console.error("Authentication failed - redirecting to signin");
        router.push("/signin");
      }
    }
  };

  const openDeleteCollectionModal = () => {
    setShowDeleteCollectionModal(true);
  };

  const closeDeleteCollectionModal = () => {
    setShowDeleteCollectionModal(false);
  };

  const handleUpdateCollection = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.error("No authentication token available");
        router.push("/signin");
        return;
      }

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections/${collection?._id}`,
        { data: { title, description } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const json = res.data;
      if (json.success) {
        setCollection(json.data.collection);
        setEditing(false);
      }
    } catch (err: any) {
      console.error("Failed to update:", err);
      if (err.response?.status === 401) {
        console.error("Authentication failed - redirecting to signin");
        router.push("/signin");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
    </div>
  );
  if (!collection) return (
    <div className="min-h-screen flex items-center justify-center text-red-600">
      Collection not found
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        {editing ? (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-2 border rounded px-3 py-2"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mb-4 border rounded px-3 py-2"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={handleUpdateCollection}
                className="bg-amber-700 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="border border-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-amber-700">{collection.title}</h1>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Image
                    src={collection.user.avatar}
                    alt={collection.user.displayName}
                    width={24}
                    height={24}
                    className="rounded-full mr-2"
                    unoptimized
                  />
                  <span>by {collection.user.displayName} (@{collection.user.username})</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${
                collection.visibility === 'public'
                  ? 'bg-green-100 text-green-800'
                  : collection.visibility === 'private'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {collection.visibility}
              </span>
            </div>
            <p className="text-gray-700 mt-2">{collection.description}</p>
            {isOwner && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="bg-amber-700 text-white px-4 py-2 rounded"
                >
                  Update
                </button>
                <button
                  onClick={openDeleteCollectionModal}
                  className="border border-red-400 text-red-600 px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            )}
            {!isOwner && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 italic">
                  This is a {collection.visibility} collection by {collection.user.displayName}
                </p>
                <Link
                  href="/collections"
                  className="text-amber-700 hover:text-amber-800 text-sm font-medium"
                >
                  ← Browse Collections
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid gap-4">
        {collection.books.map((bookInfo, idx) => {
          const bookDetail = bookDetails[idx];
          if (!bookDetail) return null;

          return (
            <div key={bookInfo.volumeId} className="bg-amber-50 p-4 rounded flex items-center justify-between">
              <div className="flex items-center gap-4">
                {bookDetail.imageLinks?.thumbnail && (
                  <Image
                    src={bookDetail.imageLinks.thumbnail}
                    alt={bookDetail.title}
                    width={60}
                    height={90}
                    className="rounded"
                    unoptimized
                  />
                )}
                <div>
                  <h3 className="font-semibold text-amber-700">{bookDetail.title}</h3>
                  <p className="text-sm text-gray-600">
                    {bookDetail.authors?.join(", ") || "Unknown Author"}
                  </p>
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={() => openDeleteModal(bookInfo.volumeId, bookDetail.title)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Remove book from collection"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookToDelete && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative border border-amber-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-amber-700 mb-4 text-center">
              Remove Book
            </h3>
            <p className="text-gray-700 mb-6 text-center leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-amber-700">"{bookToDelete.title}"</span> from the collection <span className="font-semibold text-amber-700">"{collection?.title}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteBook(bookToDelete.volumeId)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200 shadow-sm"
              >
                Remove
              </button>
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 hover:border-amber-300 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Collection Confirmation Modal */}
      {showDeleteCollectionModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeDeleteCollectionModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative border border-amber-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-red-700 mb-4 text-center">
              Delete Collection
            </h3>
            <p className="text-gray-700 mb-6 text-center leading-relaxed">
              Are you sure you want to delete the collection <span className="font-semibold text-red-700">"{collection?.title}"</span>? This action cannot be undone and will permanently remove all books from this collection.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCollection}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200 shadow-sm"
              >
                Delete Collection
              </button>
              <button
                onClick={closeDeleteCollectionModal}
                className="flex-1 px-4 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 hover:border-amber-300 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

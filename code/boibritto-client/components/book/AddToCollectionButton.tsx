"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/googleAuth";
import axios from "axios";
import clsx from "clsx";

interface Collection {
  _id: string;
  title: string;
}

interface AddToCollectionButtonProps {
  bookId: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  className?: string;
}

export default function AddToCollectionButton({
  bookId,
  onSuccess,
  onError,
  className = "w-full mt-4 px-6 py-3 rounded-lg bg-amber-700 text-white font-semibold shadow hover:bg-amber-800 transition"
}: AddToCollectionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"choose" | "existing" | "new">("choose");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVisibility, setNewVisibility] = useState<"public" | "private" | "friends">("public");
  const [busy, setBusy] = useState(false);

  const loadCollections = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return router.push("/signin");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections?owner=me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) setCollections(response.data.data.collections.slice(0, 100));
    } catch (e) {
      console.error(e);
      onError?.("Failed to load collections");
    }
  };

  const handleAddExisting = async () => {
    if (!selectedId) return;
    setBusy(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections/${selectedId}`,
        { data: { addBook: bookId } },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        onSuccess?.("Book added to collection!");
        closeModal();
      } else {
        onError?.(response.data.message || "Failed to add");
      }
    } catch (e) {
      console.error(e);
      onError?.("Error adding to collection");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newTitle.trim()) return;
    setBusy(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections`,
        {
          data: {
            title: newTitle,
            description: newDesc,
            visibility: newVisibility,
            books: [{ volumeId: bookId }],
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        onSuccess?.("Collection created & book added!");
        closeModal();
      } else {
        onError?.(response.data.message || "Failed to create collection");
      }
    } catch (e) {
      console.error(e);
      onError?.("Error creating collection");
    } finally {
      setBusy(false);
    }
  };

  const openModal = () => {
    setMode("choose");
    setOpen(true);
    loadCollections();
  };

  const closeModal = () => {
    setOpen(false);
    setSelectedId("");
    setNewTitle("");
    setNewDesc("");
    setNewVisibility("public");
  };

  return (
    <>
      <button onClick={openModal} className={className}>
        Add to Collection List
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-amber-700/5 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === "choose" && "Add to collection"}
                  {mode === "existing" && "Choose a collection"}
                  {mode === "new" && "Create new collection"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Choose mode */}
              {mode === "choose" && (
                <div className="space-y-4">
                  <button
                    onClick={() => setMode("existing")}
                    className="w-full px-4 py-3 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 transition-colors"
                  >
                    Add to existing collection
                  </button>
                  <button
                    onClick={() => setMode("new")}
                    className="w-full px-4 py-3 rounded-lg border border-amber-700 text-amber-700 font-medium hover:bg-amber-50 transition-colors"
                  >
                    Create new collection
                  </button>
                </div>
              )}

              {/* Add to existing */}
              {mode === "existing" && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="collection-select" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Collection
                    </label>
                    <select
                      id="collection-select"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      value={selectedId}
                      onChange={(e) => setSelectedId(e.target.value)}
                    >
                      <option value="">-- Select a collection --</option>
                      {collections.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setMode("choose")}
                      className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddExisting}
                      disabled={!selectedId || busy}
                      className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {busy ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Adding...
                        </>
                      ) : (
                        "Add to Collection"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Create new */}
              {mode === "new" && (
                <form onSubmit={(e) => { e.preventDefault(); handleCreateNew(); }} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
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
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
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
                      value={newVisibility}
                      onChange={(e) => setNewVisibility(e.target.value as "public" | "private" | "friends")}
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
                      onClick={() => setMode("choose")}
                      className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!newTitle.trim() || busy}
                      className="flex-1 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {busy ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        "Create & Add Book"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

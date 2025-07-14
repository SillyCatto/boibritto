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
  };

  return (
    <>
      <button onClick={openModal} className={className}>
        Add to Collection List
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Choose mode */}
            {mode === "choose" && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                  Add to collection
                </h3>
                <button
                  onClick={() => setMode("existing")}
                  className="w-full mb-4 px-4 py-3 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 transition"
                >
                  Add to existing collection
                </button>
                <button
                  onClick={() => setMode("new")}
                  className="w-full px-4 py-3 rounded-lg border border-amber-700 text-amber-700 font-medium hover:bg-amber-50 transition"
                >
                  Create new collection
                </button>
              </>
            )}

            {/* Add to existing */}
            {mode === "existing" && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Choose a collection
                </h3>
                <select
                  className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {collections.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddExisting}
                    disabled={!selectedId || busy}
                    className={clsx(
                      "flex-1 px-4 py-2 rounded-lg text-white font-medium transition",
                      selectedId && !busy
                        ? "bg-amber-700 hover:bg-amber-800"
                        : "bg-amber-300 cursor-not-allowed"
                    )}
                  >
                    {busy ? "Adding..." : "Add"}
                  </button>
                  <button
                    onClick={() => setMode("choose")}
                    className="flex-1 px-4 py-2 rounded-lg border text-gray-600"
                  >
                    Back
                  </button>
                </div>
              </>
            )}

            {/* Create new */}
            {mode === "new" && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Create new collection
                </h3>
                <input
                  type="text"
                  placeholder="Collection title *"
                  className="w-full mb-3 border border-gray-300 rounded px-3 py-2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                  placeholder="Description (optional)"
                  className="w-full mb-4 border border-gray-300 rounded px-3 py-2 resize-none"
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateNew}
                    disabled={!newTitle.trim() || busy}
                    className={clsx(
                      "flex-1 px-4 py-2 rounded-lg text-white font-medium transition",
                      newTitle.trim() && !busy
                        ? "bg-amber-700 hover:bg-amber-800"
                        : "bg-amber-300 cursor-not-allowed"
                    )}
                  >
                    {busy ? "Creating..." : "Add"}
                  </button>
                  <button
                    onClick={() => setMode("choose")}
                    className="flex-1 px-4 py-2 rounded-lg border text-gray-600"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

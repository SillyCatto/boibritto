"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/googleAuth";          
import clsx from "clsx";                        
import { fetchBookDetails } from "@/lib/googleBooks";

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed top-5 right-5 bg-amber-700 text-white px-4 py-3 rounded shadow-lg z-50 animate-fade">
      {msg}
    </div>
  );
}

function renderDescription(desc?: string) {
  if (!desc) return <span>No description available.</span>;

  const paragraphs = desc
    .replace(/<br\s*\/?\>/gi, "\n") 
    .split(/<\/?p>/gi)             
    .map((s) => s.trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => (
    <p key={i} className="mb-3 last:mb-0 text-gray-800 text-sm">
      {p}
    </p>
  ));
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [book, setBook] = useState<any>(null);
  const [loadingBook, setLoadingBook] = useState(true);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"choose" | "existing" | "new">("choose");

  const [collections, setCollections] = useState<{ _id: string; title: string }[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoadingBook(true);
      try {
        const data = await fetchBookDetails(id);
        setBook(data);
      } catch (e) {
        console.error("Failed to load book", e);
      } finally {
        setLoadingBook(false);
      }
    })();
  }, [id]);

  async function loadCollections() {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return router.push("/login");

      const res = await fetch("/api/collections?owner=me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setCollections(json.data.collections.slice(0, 100));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAddExisting() {
    if (!selectedId) return;
    setBusy(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/collections/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: { addBook: id } }),
      });
      const json = await res.json();
      if (json.success) {
        setToast("Book added to collection!");
        closeModal();
      } else {
        setToast(json.message || "Failed to add");
      }
    } catch (e) {
      console.error(e);
      setToast("Error adding to collection");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateNew() {
    if (!newTitle.trim()) return;
    setBusy(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title: newTitle,
            description: newDesc,
            books: [{ volumeId: id }],
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setToast("Collection created & book added!");
        closeModal();
      } else {
        setToast(json.message || "Failed to create collection");
      }
    } catch (e) {
      console.error(e);
      setToast("Error creating collection");
    } finally {
      setBusy(false);
    }
  }

  function openModal() {
    setMode("choose");
    setOpen(true);
    loadCollections();
  }

  function closeModal() {
    setOpen(false);
    setSelectedId("");
    setNewTitle("");
    setNewDesc("");
  }

  if (loadingBook)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );

  if (!book)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Book not found.
      </div>
    );

  const info = book;

  return (
    <>
      <Toast msg={toast} />
      {/* ----------- page body ----------- */}
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 bg-white rounded-2xl shadow-lg p-8">
          {/* Book Cover Tile */}
          <div className="col-span-1 flex flex-col items-center">
            <div className="w-48 h-72 bg-gray-100 rounded-lg shadow flex items-center justify-center overflow-hidden mb-4">
              {info.imageLinks?.thumbnail ? (
                <Image
                  src={info.imageLinks.thumbnail}
                  alt={info.title}
                  width={200}
                  height={300}
                  className="rounded-lg object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-gray-400">No image available</span>
              )}
            </div>

            {/* -------- Add to Collection button -------- */}
            <button
              onClick={openModal}
              className="w-full mt-4 px-6 py-3 rounded-lg bg-amber-700 text-white font-semibold shadow hover:bg-amber-800 transition"
            >
              Add to Collection List
            </button>

            <Link
              href="/explore"
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-amber-200 bg-white text-amber-700 font-semibold shadow hover:bg-amber-50 hover:text-amber-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Explore
            </Link>
          </div>

          {/* Book Details Tile */}
          <div className="col-span-2 flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-700 mb-2">{info.title}</h1>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Author(s):</span> {info.authors?.join(", ") || "Unknown"}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Published:</span> {info.publishedDate || "Unknown"}
              </p>
              {info.categories && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {info.categories.map((c: string, i: number) => (
                    <span key={i} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {info.averageRating && (
                <div className="mb-2 text-amber-600 font-medium">Rating: {info.averageRating} / 5</div>
              )}
            </div>
            <div className="bg-amber-50 rounded-lg p-4 shadow-inner">
              <h2 className="text-lg font-semibold text-amber-700 mb-2">Description</h2>
              {renderDescription(info.description)}
            </div>
          </div>
        </div>
      </div>

      {/* ------------ Modal Overlay ------------ */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* choose mode */}
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

            {/* add to existing */}
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

            {/* create new */}
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




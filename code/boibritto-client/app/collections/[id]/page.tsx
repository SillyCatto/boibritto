"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/googleAuth";
import { fetchBookDetails } from "@/lib/googleBooks";
import axios from "axios";
import Image from "next/image";

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

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/collections/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true, 
        }
        );

        const json = res.data;
        if (json.success) {
          setCollection(json.data.collection);
          setTitle(json.data.collection.title);
          setDescription(json.data.collection.description);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch collection:", err);
      }
    };

    fetchCollection();
  }, [id]);

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
    const confirm = window.confirm(`Remove this book from collection: "${collection?.title}"?`);
    if (!confirm || !collection) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.patch(
        `/api/collections/${collection._id}`,
        { data: { removeBook: volumeId } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = res.data;
      if (json.success) setCollection(json.data.collection);
    } catch (err) {
      console.error("Failed to remove book:", err);
    }
  };

  const handleDeleteCollection = async () => {
    const confirm = window.confirm(`Are you sure you want to delete this collection?`);
    if (!confirm || !collection) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.delete(`/api/collections/${collection._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push("/profile");
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  };

  const handleUpdateCollection = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axios.patch(
        `/api/collections/${collection?._id}`,
        { data: { title, description } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const json = res.data;
      if (json.success) {
        setCollection(json.data.collection);
        setEditing(false);
      }
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading collection...</div>;
  if (!collection) return <div className="p-6 text-red-600">Collection not found</div>;

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
            <h1 className="text-2xl font-bold text-amber-700">{collection.title}</h1>
            <p className="text-gray-700 mt-2">{collection.description}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setEditing(true)}
                className="bg-amber-700 text-white px-4 py-2 rounded"
              >
                Update
              </button>
              <button
                onClick={handleDeleteCollection}
                className="border border-red-400 text-red-600 px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4">
        {bookDetails.map((book, idx) => (
          <div key={idx} className="bg-amber-50 p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-4">
              {book.imageLinks?.thumbnail && (
                <Image
                  src={book.imageLinks.thumbnail}
                  alt={book.title}
                  width={60}
                  height={90}
                  className="rounded"
                  unoptimized
                />
              )}
              <div>
                <h3 className="font-semibold text-amber-700">{book.title}</h3>
                <p className="text-sm text-gray-600">
                  {book.authors?.join(", ") || "Unknown Author"}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDeleteBook(book.volumeId)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

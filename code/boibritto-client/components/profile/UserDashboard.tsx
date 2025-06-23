"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ProfileData {
  _id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  interestedGenres: string[];
  createdAt: string;
  updatedAt: string;
}

interface Collection {
  _id: string;
  title: string;
  description: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface ReadingItem {
  _id: string;
  volumeId: string;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface Blog {
  _id: string;
  title: string;
  visibility: string;
  spoilerAlert: boolean;
  genres: string[];
  createdAt: string;
  updatedAt: string;
}

const tabs = ["My Collections", "Reading Tracker", "Blogs", "Discussions"];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("My Collections");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [readingList, setReadingList] = useState<ReadingItem[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await window.firebase.auth().currentUser?.getIdToken();
        const res = await fetch("/api/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        if (json.success) {
          setProfile(json.data.profile_data);
          setCollections(json.data.collections || []);
          setReadingList(json.data.reading_tracker || []);
          setBlogs(json.data.blogs || []);
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  if (!profile) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <main className="bg-white text-gray-900 py-16 px-6 sm:px-10 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
          <Image
            src={profile.avatar}
            alt="User Avatar"
            width={80}
            height={80}
            className="rounded-full border border-gray-200"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-sm text-gray-500">
              @{profile.username} • {profile.email}
            </p>
            <p className="mt-2 text-gray-700">{profile.bio}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.interestedGenres.map((genre, index) => (
                <span
                  key={index}
                  className="bg-amber-100 text-amber-700 text-sm px-3 py-1 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-md transition ${
                  activeTab === tab ? "bg-amber-100 text-amber-700" : "text-gray-600 hover:text-amber-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "My Collections" && (
            <div className="space-y-4">
              {collections.map((collection) => (
                <div key={collection._id} className="border p-4 rounded-xl bg-amber-50">
                  <h3 className="font-semibold text-amber-700">{collection.title}</h3>
                  <p className="text-gray-700 text-sm">{collection.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Reading Tracker" && (
            <div className="space-y-2">
              {readingList.map((item) => (
                <div key={item._id} className="border p-3 rounded-md bg-amber-50 text-sm">
                  Volume ID: <strong>{item.volumeId}</strong> — Status: <span className="text-amber-700">{item.status}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Blogs" && (
            <div className="space-y-3">
              {blogs.map((blog) => (
                <div key={blog._id} className="border p-3 rounded-md bg-amber-50">
                  <h4 className="font-semibold text-amber-700">{blog.title}</h4>
                  <p className="text-xs text-gray-500">Visibility: {blog.visibility}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Discussions" && (
            <div className="text-gray-600">/* Discussions tab: coming soon */</div>
          )}
        </div>
      </div>
    </main>
  );
}


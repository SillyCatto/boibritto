"use client";

import { useState } from "react";
import Image from "next/image";

const mockUser = {
  avatar: "https://via.placeholder.com/80",
  displayName: "Raiyan Muhtasim",
  username: "raiyan123",
  email: "raiyan@gmail.com",
  bio: "I love reading sci-fi and writing fiction.",
  genres: ["Fiction", "Horror", "Sci-Fi"],
};

const tabs = ["My Collections", "Reading Tracker", "Blogs", "Discussions"];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("My Collections");

  return (
    <main className="bg-white text-gray-900 py-16 px-6 sm:px-10 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
          <Image
            src={mockUser.avatar}
            alt="User Avatar"
            width={80}
            height={80}
            className="rounded-full border border-gray-200"
          />
          <div>
            <h1 className="text-2xl font-bold">{mockUser.displayName}</h1>
            <p className="text-sm text-gray-500">
              @{mockUser.username} • {mockUser.email}
            </p>
            <p className="mt-2 text-gray-700">{mockUser.bio}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {mockUser.genres.map((genre, index) => (
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
                  activeTab === tab
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-600 hover:text-amber-700"
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
            <div className="text-gray-600">/* Render user's book collections here */</div>
          )}
          {activeTab === "Reading Tracker" && (
            <div>
              <div className="text-gray-600 mb-4">/* Add graph/chart visualization here */</div>
              <div className="text-gray-600">/* Render reading list here */</div>
            </div>
          )}
          {activeTab === "Blogs" && (
            <div className="text-gray-600">/* Show user blogs/posts here */</div>
          )}
          {activeTab === "Discussions" && (
            <div className="text-gray-600">/* List discussion threads here */</div>
          )}
        </div>
      </div>
    </main>
  );
}

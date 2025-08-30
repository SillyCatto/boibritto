'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged , User } from 'firebase/auth';
import UserDashboard from "@/components/profile/UserDashboard";
import GenreStats from "@/components/profile/GenreStats";

export default function ProfilePage() {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 text-lg font-medium mb-4">Please sign in to view your profile</p>
          <button
            className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
            onClick={() => window.location.href = "/signin"}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Dashboard Section */}
      <UserDashboard />
      
      {/* Genre Stats Section - Centered and Better Spaced */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-amber-700 mb-2">Reading Analytics</h2>
          <p className="text-gray-600">Your reading patterns and preferences</p>
        </div>
        
        {/* Centered Genre Stats with better width */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <GenreStats />
          </div>
        </div>
      </div>
    </div>
  );
}
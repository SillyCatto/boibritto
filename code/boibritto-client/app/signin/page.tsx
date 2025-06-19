"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
//import { signInWithGoogle } from "@/lib/auth"; 

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      
//      
      // Call your backend API to check if user exists
    //  const idToken = await userCredential.user.getIdToken();
      const response = await fetch("/api/auth/login", {
        method: "GET",
        headers: {
      //    Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.data.newUser) {
          // New user - redirect to complete signup
          router.push("/signup/complete");
        } else {
          // Existing user - redirect to home or dashboard
          router.push("/");
        }
      } else {
        setError(data.message || "Sign in failed");
      }
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto px-6 py-12 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="font-serif text-3xl font-bold text-amber-700">BoiBritto</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue your reading journey</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors mb-4 relative"
        >
          <Image 
            src="/images/google-logo.svg" 
            alt="Google" 
            width={18} 
            height={18} 
          />
          {isLoading ? "Signing in..." : "Sign in with Google"}
          
          {isLoading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </span>
          )}
        </button>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>By signing in, you agree to our <Link href="/terms" className="text-amber-700 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-amber-700 hover:underline">Privacy Policy</Link></p>
        </div>
      </div>
      
      <div className="w-full max-w-3xl mx-auto px-6 mt-8">
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <Image
              src="/images/book-illustration.svg"
              alt="BoiBritto Features"
              width={120}
              height={120}
              className="h-auto w-auto"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Join the BoiBritto Community</h3>
            <p className="text-gray-600">Track reading progress, discover new books, share your thoughts with fellow book lovers, and build your literary legacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
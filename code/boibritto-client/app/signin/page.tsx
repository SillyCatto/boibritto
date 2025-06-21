"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { googleSignInPopup } from "@/lib/googleAuth";
import { FaGoogle } from "react-icons/fa";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { user, idToken } = await googleSignInPopup();
      // Call backend to check user
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"}/api/auth/login`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
          withCredentials: true,
        }
      );
      const data = res.data;
      console.log("Sign in response:", data);
      if (data.success) {
        if (data.data.newUser) {
          router.push("/signup");
        } else {
          router.push("/");
        }
      } else {
        setError(data.message || "Sign in failed");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to sign in with Google."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto px-8 py-14 bg-white rounded-2xl shadow-lg relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-100 rounded-full opacity-70"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-50 rounded-full"></div>
        
        <div className="relative">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
            </div>
            <h1 className="font-serif text-3xl font-bold text-amber-700 mb-2">Welcome to BoiBritto</h1>
            <p className="text-gray-600 max-w-sm mx-auto">Sign in to continue your reading journey and connect with fellow book lovers</p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Sign in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-4 px-4 text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors mb-6 relative shadow-sm"
          >
            <FaGoogle className="text-amber-700" size={20} />
            <span className="font-medium">{isLoading ? "Signing in..." : "Sign in with Google"}</span>
            {isLoading && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </span>
            )}
          </button>
          
          {/* Sign up link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              New to BoiBritto?{" "}
              <Link href="/signup" className="text-amber-700 font-medium hover:text-amber-800 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
          
          {/* Separator */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">BoiBritto Features</span>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 rounded-lg bg-amber-50">
              <p className="text-amber-800 text-sm font-medium">Track Reading</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <p className="text-amber-800 text-sm font-medium">Join Discussions</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <p className="text-amber-800 text-sm font-medium">Discover Books</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50">
              <p className="text-amber-800 text-sm font-medium">Connect Readers</p>
            </div>
          </div>
          
          {/* Terms and privacy  FOR FUTURE SCOPE IF WE GET TIME*/}
         
          </div>
        </div>
      </div>
  );
}
"use client";
import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { googleSignInPopup } from "@/lib/googleAuth";

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
      <div className="max-w-md w-full mx-auto px-6 py-12 bg-white rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-amber-700 mb-2">BoiBritto</h1>
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
          <Image src="/images/google-logo.svg" alt="Google" width={18} height={18} />
          {isLoading ? "Signing in..." : "Sign in with Google"}
          {isLoading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
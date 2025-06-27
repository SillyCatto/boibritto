"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const phrases = [
  `Personal Collection`,
  `Next Writing Platform`,
  `Literary Community`,
  `Inspiration to Write`,
];

const TypewriterText = ({ text, speed = 80 }: { text: string; speed?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className="inline-block text-amber-700">
      {displayText}
      {currentIndex < text.length && <span className="ml-1 animate-pulse">|</span>}
    </span>
  );
};

export default function Hero() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentPhrase = phrases[currentPhraseIndex];

  return (
    <section className="bg-gradient-to-br from-amber-50 to-white py-16 px-6 sm:px-10 flex-grow relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            BoiBritto for your{" "}
            <br />
            <TypewriterText text={currentPhrase} />
          </h1>
          <p className="text-xl text-gray-600 max-w-md">
            Join BoiBritto to explore books, create your own, and connect with passionate readers and writers. Start building your literary legacy today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/explore"
              className="px-8 py-3 rounded-full bg-amber-700 text-white font-medium hover:bg-amber-800 text-center"
            >
              Explore Books
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 rounded-full border border-amber-700 text-amber-700 font-medium hover:bg-amber-50 text-center"
            >
              Sign Up Free
            </Link>
            <Link
              href="/profile"
              className="px-8 py-3 rounded-full bg-white border border-amber-700 text-amber-700 font-medium hover:bg-amber-50 text-center"
            >
              Go to Profile
            </Link>
          </div>
        </div>

        {/* Book Images Section */}
        <div className="relative h-80 md:h-96">
          {/* Background Tilted Card */}
          <div className="absolute top-0 right-0 h-64 w-48 bg-amber-700 rounded-lg transform rotate-6"></div>

          {/* Secondary Book Image */}
          <div className="absolute top-8 right-8 h-64 w-48 bg-white shadow-xl rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Featured book 1"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
          </div>

          {/* Main Book Image */}
          <div className="absolute top-16 right-24 h-64 w-48 bg-white shadow-xl rounded-lg overflow-hidden transform -rotate-6">
            <div className="relative w-full h-full">
              <Image
                src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Main Book Image"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg"
              />
              <div className="absolute inset-0 bg-amber-700 opacity-10 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

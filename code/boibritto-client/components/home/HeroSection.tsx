import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Your reading journey,<br />
              <span className="text-emerald-600 dark:text-emerald-400">reimagined</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Track your reading progress, discover new books, join discussions, 
              and share your own stories — all in one community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="px-8 py-3 rounded-lg bg-emerald-600 text-white text-center font-medium hover:bg-emerald-700 transition">
                Join BoiBritto
              </Link>
              <Link href="/discover" className="px-8 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-center font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                Explore Books
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <Image
                src="/assets/hero-image.svg" 
                alt="BoiBritto Platform Illustration"
                width={500}
                height={400}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
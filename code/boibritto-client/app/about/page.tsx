import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | BoiBritto",
  description:
    "Learn about BoiBritto – your ultimate platform for discovering, reviewing, and discussing books.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero section with similar styling to home page */}
      <section className="bg-white py-16 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About BoiBritto
          </h1>{" "}
          <p className="text-lg leading-relaxed text-gray-700">
            <span className="text-amber-700 font-semibold">BoiBritto</span> is
            your ultimate hub for discovering, sharing, and discussing books.
            Whether you&apos;re a casual reader, an avid book lover, or an
            aspiring writer, BoiBritto gives you the tools to connect with
            stories and with fellow readers.
          </p>
        </div>
      </section>

      {/* Features section with amber-50 background like Features.tsx */}
      <section className="bg-amber-50 py-12 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Core Features
          </h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <ul className="grid md:grid-cols-2 gap-4 text-base">
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Search books
                  </span>{" "}
                  using Google Books and OpenLibrary APIs.
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Get ratings, summaries,
                  </span>{" "}
                  and detailed overviews of books.
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Explore categories
                  </span>{" "}
                  like bestsellers, fiction, and more via the New York Times
                  Book API.
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Track your reading
                  </span>
                  : mark books as Interested, Reading, or Completed.
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Organize collections
                  </span>{" "}
                  into personalized lists and share them.
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Review books
                  </span>{" "}
                  and see what others are saying.
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Join discussions
                  </span>{" "}
                  and start forum threads—mark spoilers with care.
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Write blogs & articles
                  </span>{" "}
                  with our easy-to-use Markdown editor.
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Optional social feed:
                  </span>{" "}
                  share book thoughts like a Facebook timeline.
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-amber-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900">
                    Publish your own books
                  </span>{" "}
                  using our rich text writer powered by Tiptap.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Mission section with white background */}
      <section className="bg-white py-12 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Mission
          </h2>
          <div className="bg-amber-50 rounded-xl p-6">
            <p className="text-gray-700 leading-relaxed">
              We aim to foster a vibrant book-loving community where knowledge,
              stories, and creativity flow freely. BoiBritto is designed for
              readers, by readers—uniting people through the power of books and
              conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action section like the homepage */}
      <section className="bg-amber-700 py-12 px-6 sm:px-10 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Join the Journey</h2>{" "}
          <p className="text-amber-100 mb-6 leading-relaxed">
            Whether you&apos;re here to find your next favorite read or to
            publish your own, BoiBritto welcomes you. Dive in, explore, and
            become part of a growing literary world.
          </p>
          <a
            href="/signup"
            className="inline-block px-6 py-2.5 rounded-full bg-white text-amber-700 font-medium hover:bg-amber-100 transition-colors"
          >
            Get Started Today
          </a>
        </div>
      </section>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  getAuth,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { initFirebase } from "@/lib/googleAuth";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import ReportModal from "@/components/ui/ReportModal";

// Initialize Firebase
initFirebase();

interface User {
  _id: string;
  uid: string; // Firebase UID
  username: string;
  displayName: string;
  avatar: string;
}

interface Blog {
  _id: string;
  user: User;
  title: string;
  content: string;
  spoilerAlert: boolean;
  genres: string[];
  visibility: "public" | "private" | "friends";
  createdAt: string;
  updatedAt: string;
}

export default function BlogViewPage() {
  const params = useParams();
  const blogId = params?.id as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (blogId) {
      const loadBlog = async () => {
        try {
          const auth = getAuth();
          let headers = {};

          if (auth.currentUser) {
            const token = await auth.currentUser.getIdToken();
            headers = {
              Authorization: `Bearer ${token}`,
            };
          }

          const response = await axios.get(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"
            }/api/blogs/${blogId}`,
            {
              headers,
              withCredentials: true,
            }
          );

          if (response.data.success) {
            setBlog(response.data.data.blog);
          } else {
            setError(response.data.message || "Failed to load blog");
          }
        } catch (error: unknown) {
          console.error("Failed to load blog:", error);
          const errorMessage =
            (
              error as {
                response?: { data?: { message?: string } };
                message?: string;
              }
            )?.response?.data?.message ||
            (error as { message?: string })?.message ||
            "Failed to load blog";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        loadBlog();
      });

      return () => unsubscribe();
    }
  }, [blogId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate estimated read time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
  };

  // Check if current user is the blog author
  const isAuthor = currentUser && blog && currentUser.uid === blog.user.uid;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-600 mb-4">{error || "Blog not found"}</p>
        <Link
          href="/blogs"
          className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/blogs"
              className="text-amber-700 hover:text-amber-800 flex items-center gap-1 text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              Back to Blogs
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {blog.title}
          </h1>

          {/* Author and metadata */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Image
                src={blog.user.avatar}
                alt={blog.user.displayName}
                width={48}
                height={48}
                className="rounded-full mr-4"
                unoptimized
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {blog.user.displayName}
                  </h3>
                  <span className="text-gray-500">@{blog.user.username}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{formatDate(blog.createdAt)}</span>
                  <span className="mx-2">•</span>
                  <span>{calculateReadTime(blog.content)} min read</span>
                  {blog.updatedAt !== blog.createdAt && (
                    <>
                      <span className="mx-2">•</span>
                      <span>Updated {formatDate(blog.updatedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {/* Report button - only show if not author and user is logged in */}
              {currentUser && !isAuthor && (
                <button
                  onClick={() => {
                    console.log("Report button clicked, blogId:", blogId);
                    console.log("blog object:", blog);
                    setShowReportModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white border border-amber-700 rounded-lg hover:bg-amber-800 hover:border-amber-800 transition-all duration-200 font-medium text-sm shadow-sm"
                  title="Report this blog"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l1.664 6L3 15l13.333-6L3 3z"
                    />
                  </svg>
                  Report
                </button>
              )}
            </div>
          </div>

          {/* Genres and Spoiler Alert */}
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.spoilerAlert && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1">
                <span>⚠️</span>
                <span>Spoiler Alert</span>
              </span>
            )}
            {blog.genres &&
              blog.genres.length > 0 &&
              blog.genres.map((genre: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                >
                  {genre}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 mt-6">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-gray-900 mb-2 mt-5">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 mt-4">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-amber-700 hover:text-amber-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-1">
                    {children}
                  </ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-amber-200 pl-4 py-2 my-4 bg-amber-50 text-gray-700 italic">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                      <code className="text-gray-800 text-sm font-mono">
                        {children}
                      </code>
                    </pre>
                  );
                },
                img: ({ src, alt }) => (
                  <div className="my-6">
                    <img
                      src={src}
                      alt={alt}
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-gray-300">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-900">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 px-4 py-2 text-gray-700">
                    {children}
                  </td>
                ),
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Back to blogs button */}
        <div className="mt-8 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Back to All Blogs
          </Link>
        </div>
      </div>

      {/* Report Modal */}
      {currentUser && !isAuthor && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="blog"
          targetId={blogId || ""}
          targetTitle={blog?.title}
        />
      )}
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="py-16 bg-emerald-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How BoiBritto Works</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to begin your journey.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-600 dark:bg-emerald-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">1</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create an Account</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Sign up and set up your reader or writer profile with your interests.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-600 dark:bg-emerald-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">2</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Build Your Library</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Add books to your collections and track your reading progress.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-600 dark:bg-emerald-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">3</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connect & Discuss</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Follow other readers, join discussions, and share your thoughts.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-600 dark:bg-emerald-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">4</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create & Publish</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Share your own writing and receive feedback from the community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
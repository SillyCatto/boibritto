export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Our Users Say</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hear from our community of readers and writers.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-200 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Sarah K.</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avid Reader</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              "BoiBritto has completely transformed how I approach reading. I love being able to track my progress and discuss books with others who share my interests."
            </p>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-200 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Rahul M.</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aspiring Writer</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              "As someone who's always wanted to write, the supportive community on BoiBritto has given me the confidence to share my stories and improve my craft."
            </p>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-emerald-200 rounded-full mr-4"></div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Maya T.</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Book Club Organizer</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              "Our book club loves using BoiBritto to organize our reading lists and discussions. It's made managing our group so much easier and more engaging."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
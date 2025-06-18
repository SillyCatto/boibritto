import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-16 bg-emerald-600 dark:bg-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Ready to Begin Your Reading Journey?</h2>
        <p className="text-emerald-100 max-w-2xl mx-auto mb-8">
          Join thousands of readers and writers in our growing community. Discover new books, track your reading, and share your thoughts.
        </p>
        <Link href="/signup" className="inline-block px-8 py-3 bg-white text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition">
          Join BoiBritto Today
        </Link>
      </div>
    </section>
  );
}
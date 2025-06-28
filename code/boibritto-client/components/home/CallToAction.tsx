import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="bg-amber-700 py-12 px-6 sm:px-10 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start your reading journey?</h2>
        <p className="text-amber-100 mb-8 max-w-2xl mx-auto">
          Join thousands of readers who have found their next favorite book with BoiBritto.
        </p>
        <Link href="/signin" className="inline-block px-8 py-3 rounded-full bg-white text-amber-700 font-medium hover:bg-amber-100">
          Get Started Today
        </Link>
      </div>
    </section>
  );
}
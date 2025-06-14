import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | BoiBritto",
  description: "Learn about BoiBritto – your ultimate platform for discovering, reviewing, and discussing books.",
};

export default function AboutPage() {
  return (
    <main className="bg-gray-900 text-gray-300 min-h-screen py-16 px-6 sm:px-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <section>
          <h1 className="text-4xl font-bold text-white mb-4">About BoiBritto</h1>
          <p className="text-lg leading-relaxed">
            <span className="text-amber-400 font-semibold">BoiBritto</span> is your ultimate hub for discovering, sharing, and discussing books. Whether you're a casual reader, an avid book collector, or an aspiring writer, BoiBritto gives you the tools to connect with stories and with fellow readers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">Core Features</h2>
          <ul className="list-disc list-inside space-y-2 text-base">
            <li><span className="text-white font-medium">Search books</span> using Google Books and OpenLibrary APIs.</li>
            <li><span className="text-white font-medium">Get ratings, summaries,</span> and detailed overviews of books.</li>
            <li><span className="text-white font-medium">Explore categories</span> like bestsellers, fiction, and more via the New York Times Book API.</li>
            <li><span className="text-white font-medium">Track your reading</span>: mark books as Interested, Reading, or Completed.</li>
            <li><span className="text-white font-medium">Organize collections</span> into personalized lists and share them.</li>
            <li><span className="text-white font-medium">Review books</span> and see what others are saying.</li>
            <li><span className="text-white font-medium">Join discussions</span> and start forum threads—mark spoilers with care.</li>
            <li><span className="text-white font-medium">Write blogs & articles</span> with our easy-to-use Markdown editor.</li>
            <li><span className="text-white font-medium">Optional social feed:</span> share book thoughts like a Facebook timeline.</li>
            <li><span className="text-white font-medium">Publish your own books</span> using our rich text writer powered by Tiptap.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">Our Mission</h2>
          <p className="text-base leading-relaxed">
            We aim to foster a vibrant book-loving community where knowledge, stories, and creativity flow freely. BoiBritto is designed for readers, by readers—uniting people through the power of books and conversation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">Join the Journey</h2>
          <p className="text-base leading-relaxed">
            Whether you're here to find your next favorite read or to publish your own, BoiBritto welcomes you. Dive in, explore, and become part of a growing literary world.
          </p>
        </section>
      </div>
    </main>
  );
}

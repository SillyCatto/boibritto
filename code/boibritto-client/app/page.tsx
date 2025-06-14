
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CallToAction from "@/components/home/CallToAction";
import TrendingBooks from "@/components/home/TrendingBooks";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <Features />
      <TrendingBooks />
      <CallToAction />

    </div>
  );
}
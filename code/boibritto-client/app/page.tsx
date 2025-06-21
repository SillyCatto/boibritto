
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CallToAction from "@/components/home/CallToAction";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <Features />
      <CallToAction />

    </div>
  );
}
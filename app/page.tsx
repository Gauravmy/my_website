import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { FitCheck } from "@/components/FitCheck";
import { Footer } from "@/components/Footer";
import { Stage } from "@/components/gl/Stage";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Process } from "@/components/Process";
import { Profiles } from "@/components/Profiles";
import { Recommendations } from "@/components/Recommendations";
import { RevealObserver } from "@/components/RevealObserver";
import { Skills } from "@/components/Skills";
import { Widgets } from "@/components/Widgets";
import { Work } from "@/components/Work";

export default function Home() {
  return (
    <>
      <Stage />
      <Nav />
      <main id="main">
        <Hero />
        <FitCheck />
        <Work />
        <Process />
        <Experience />
        <Skills />
        <Profiles />
        <About />
        <Recommendations />
        <Contact />
      </main>
      <Footer />
      <RevealObserver />
      <Widgets />
    </>
  );
}

import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "@/components/Icons";
import { Nav } from "@/components/Nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="on-blue">
        <div className="wrap flex min-h-[70svh] flex-col justify-end pb-14 pt-28">
          <p className="t-mono text-on-blue-2">404</p>
          <h1 className="t-display mt-3">This page isn&apos;t here.</h1>
          <p className="t-read mt-4 max-w-xl text-on-blue-2">The link may be from my old site. All my work is on the home page.</p>
          <div className="mt-6">
            <Link href="/" className="btn btn-solid">
              Go to the home page
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

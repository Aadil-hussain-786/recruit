"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isHome = pathname === "/";

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <main className={`min-h-screen ${isHome ? "" : "pt-20"}`}>
          {children}
        </main>
      </div>
    );
  }

  // To prevent "merging" feel, we keep the main content hidden or stationary behind the loading screen
  return (
    <>
      <AnimatePresence mode="wait">
        <SmoothScroll key="content">
          {/* Global Advanced Background */}
          
          <Navbar />
          <main className={`min-h-screen ${isHome ? "" : "pt-20"}`}>
            {children}
          </main>
          
          {/* Show footer on internal pages or at the end of home */}
          {pathname !== "/" && <Footer />}
        </SmoothScroll>
      </AnimatePresence>
    </>
  );
}

"use client"

import { Scrapbook } from "@/components/scrapbook"
import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    // This ensures the URL parameters are properly processed when the app loads
    const handleUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const sharedId = urlParams.get("diary")

      if (sharedId) {
        // The Scrapbook component will handle loading the shared diary
      }
    }

    handleUrlParams()
  }, [])

  return (
    <main className="w-full h-screen overflow-hidden bg-[#f0e6d2] flex items-center justify-center">
      {/* Wood texture background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/wood-texture.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.8)",
        }}
      />

      {/* Subtle lighting effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />

      {/* Book container - takes up the entire screen */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <Scrapbook />
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
    </main>
  )
}

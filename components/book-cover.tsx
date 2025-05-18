"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface BookCoverProps {
  onOpen: () => void
}

export function BookCover({ onOpen }: BookCoverProps) {
  const isMobile = useMobile()

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Book shadow */}
      <div className="absolute w-[calc(100%-60px)] h-[calc(100%-60px)] max-w-5xl max-h-[80vh] bg-black/30 rounded-lg blur-xl transform translate-y-6"></div>

      {/* Book container */}
      <motion.div
        className="relative w-full h-full max-w-5xl max-h-[80vh] md:max-h-[85vh] rounded-lg overflow-hidden shadow-2xl flex"
        initial={{ rotateY: 0 }}
        whileHover={{
          rotateY: 15,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {/* Book spine */}
        <div className="w-[20px] md:w-[40px] h-full bg-gradient-to-r from-[#9c27b0] to-[#673ab7] rounded-l-lg shadow-inner flex flex-col justify-center items-center">
          {/* Binding details */}
          <div className="h-[80%] w-[3px] md:w-[5px] bg-[#4a148c] mx-auto rounded-full"></div>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-[15px] md:w-[30px] h-[2px] md:h-[3px] bg-[#4a148c]"
              style={{ left: isMobile ? "2px" : "5px", top: `${10 + i * 5}%` }}
            ></div>
          ))}
        </div>

        {/* Book cover */}
        <div className="flex-1 h-full bg-gradient-to-br from-[#9c27b0] via-[#673ab7] to-[#3f51b5] p-8 flex flex-col">
          <div className="border-4 border-[#e1bee7]/30 rounded-lg p-6 flex-1 flex flex-col items-center justify-center text-white">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-[#ff9800] opacity-20 blur-sm"></div>
              <div className="absolute bottom-8 right-8 w-20 h-20 rounded-full bg-[#00bcd4] opacity-30 blur-sm"></div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center z-10"
            >
              <div className="relative inline-block">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg text-[#e1bee7]">DEAR CHOTIBILLO</h2>
                {/* Decorative underline */}
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-2 bg-[#ff9800] rounded-full opacity-50"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </div>

              <div className="mt-12 relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ff9800]/50 to-[#00bcd4]/50 rounded-lg blur opacity-75 transition duration-1000"></div>
                <Button
                  onClick={onOpen}
                  size="lg"
                  className="relative bg-[#e1bee7] text-[#4a148c] hover:bg-[#e1bee7]/90 transition-all duration-300 transform hover:scale-105 font-bold"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Open Book
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Book edge effects */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-black/20 to-transparent"></div>
        <div className="absolute left-0 bottom-0 right-0 h-2 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="absolute left-0 top-0 right-0 h-1 bg-gradient-to-b from-white/20 to-transparent"></div>
      </motion.div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookCover } from "@/components/book-cover"
import { ScrapbookPage } from "@/components/scrapbook-page"
import { FloatingToolbar } from "@/components/floating-toolbar"
import { ShareDialog } from "@/components/share-dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle, Save, Settings, Share2 } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { nanoid } from "nanoid"

// Default empty page template
const emptyPage = {
  id: "",
  title: "New Memory",
  image: "",
  textBoxes: [],
  stickers: [],
  drawings: [],
}

export function Scrapbook() {
  const [isOpen, setIsOpen] = useState(false)
  const [pages, setPages] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [selectedElement, setSelectedElement] = useState<any | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null)
  const [dragProgress, setDragProgress] = useState(0)
  const [dragDirection, setDragDirection] = useState<"next" | "prev" | null>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [diaryId, setDiaryId] = useState<string>("")
  const [sharedDiaryId, setSharedDiaryId] = useState<string>("")
  const [isViewingShared, setIsViewingShared] = useState(false)
  const bookRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize with two empty pages and generate diary ID
  useEffect(() => {
    // Check URL for shared diary ID first
    const urlParams = new URLSearchParams(window.location.search)
    const sharedId = urlParams.get("diary")

    if (sharedId) {
      setSharedDiaryId(sharedId)
      // Try to load the shared diary
      const loadedData = loadSharedDiary(sharedId)

      if (loadedData) {
        // If we successfully loaded shared data, use it
        setPages(loadedData.pages || [])
        setDiaryId(sharedId) // Use the shared ID as our current diary ID
        setIsViewingShared(true)
      } else {
        // If shared diary not found, initialize with default pages and new ID
        initializeNewDiary()
      }
    } else if (pages.length === 0) {
      // No shared diary in URL, initialize with default pages
      initializeNewDiary()
    }

    // Initialize audio
    audioRef.current = new Audio("/page-flip.mp3")
  }, [])

  // Add this new function to initialize a new diary
  const initializeNewDiary = () => {
    setPages([
      { ...emptyPage, id: "page-1" },
      { ...emptyPage, id: "page-2" },
    ])
    setDiaryId(nanoid(10))
  }

  const handleOpenBook = () => {
    setIsOpen(true)
  }

  const handleCloseBook = () => {
    setIsOpen(false)
  }

  const handleAddPage = () => {
    const newPageId = `page-${pages.length + 1}`
    const newPage = { ...emptyPage, id: newPageId }

    // Insert new page after current page
    const updatedPages = [...pages.slice(0, currentPage + 1), newPage, ...pages.slice(currentPage + 1)]

    setPages(updatedPages)

    toast({
      title: "New page added!",
      description: "A blank page has been added to your scrapbook.",
    })
  }

  const handleUpdatePage = (pageId: string, updates: any) => {
    const pageIndex = pages.findIndex((p) => p.id === pageId)
    if (pageIndex === -1) return

    const updatedPages = [...pages]
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      ...updates,
    }

    setPages(updatedPages)
  }

  // Update the loadSharedDiary function to return the loaded data
  const loadSharedDiary = (id: string) => {
    // In a real app, this would fetch from a database
    // For this example, we'll use localStorage
    try {
      const data = localStorage.getItem(`scrapbook-${id}`)
      if (data) {
        const parsedData = JSON.parse(data)

        toast({
          title: "Shared diary loaded!",
          description: "You're viewing a shared scrapbook.",
        })

        return parsedData
      } else {
        toast({
          title: "Shared diary not found",
          description: "The diary you're trying to view doesn't exist or hasn't been shared.",
          variant: "destructive",
        })
        return null
      }
    } catch (error) {
      toast({
        title: "Error loading diary",
        description: "There was a problem loading the shared diary.",
        variant: "destructive",
      })
      return null
    }
  }

  // Update the handleSaveScrapbook function to ensure it saves properly
  const handleSaveScrapbook = () => {
    // Make sure we have a diary ID
    if (!diaryId) {
      setDiaryId(nanoid(10))
      return
    }

    // In a real app, this would save to a database
    // For this example, we'll save to localStorage
    const scrapbookData = JSON.stringify({
      id: diaryId,
      pages: pages,
      lastUpdated: new Date().toISOString(),
    })

    localStorage.setItem(`scrapbook-${diaryId}`, scrapbookData)

    toast({
      title: "Scrapbook saved!",
      description: "Your memories have been saved successfully.",
    })
  }

  const handleShareDiary = () => {
    // Make sure the diary is saved before sharing
    handleSaveScrapbook()
    setShowShareDialog(true)
  }

  // Mouse/Touch event handlers for page turning
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isFlipping || selectedTool) return

    const bookElement = bookRef.current
    if (!bookElement) return

    const rect = bookElement.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Only start drag if near the edges of the book
    const x = clientX - rect.left
    const y = clientY - rect.top
    const isLeftEdge = x < rect.width * 0.2
    const isRightEdge = x > rect.width * 0.8

    // Determine if we can turn in this direction
    const canTurnPrev = currentPage > 0
    const canTurnNext = currentPage < pages.length - 1

    if ((isLeftEdge && canTurnPrev) || (isRightEdge && canTurnNext)) {
      setDragStart({ x, y })
      setDragCurrent({ x, y })
      setDragDirection(isLeftEdge ? "prev" : "next")

      // Add dragging class to enable the cursor change
      document.body.classList.add("dragging-page")

      // Play sound at low volume to indicate drag start
      if (audioRef.current) {
        audioRef.current.volume = 0.2
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {
          // Silent catch - audio might fail on some browsers without user interaction
        })
      }
    }
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart || !dragCurrent || !dragDirection) return

    const bookElement = bookRef.current
    if (!bookElement) return

    const rect = bookElement.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top
    setDragCurrent({ x, y })

    // Calculate drag progress (0 to 1)
    let progress
    if (dragDirection === "next") {
      // For next page, drag from right to left
      progress = Math.min(1, Math.max(0, (dragStart.x - x) / (rect.width * 0.5)))
    } else {
      // For previous page, drag from left to right
      progress = Math.min(1, Math.max(0, (x - dragStart.x) / (rect.width * 0.5)))
    }

    setDragProgress(progress)
  }

  const handleDragEnd = () => {
    if (!dragStart || !dragDirection) {
      document.body.classList.remove("dragging-page")
      return
    }

    // If progress is more than 30%, complete the turn
    if (dragProgress > 0.3) {
      completeTurn()
    } else {
      // Otherwise cancel the turn
      cancelTurn()
    }

    // Reset drag state
    setDragStart(null)
    setDragCurrent(null)
    setDragProgress(0)
    setDragDirection(null)
    document.body.classList.remove("dragging-page")
  }

  const completeTurn = () => {
    if (!dragDirection) return

    setIsFlipping(true)

    // Play sound effect at full volume
    if (audioRef.current) {
      audioRef.current.volume = 1.0
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Silent catch - audio might fail on some browsers without user interaction
      })
    }

    // Animate to complete the turn
    const duration = 600 // ms
    const startTime = Date.now()
    const startProgress = dragProgress

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)

      // Use easing function for more natural movement
      const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI)

      // Interpolate from current progress to 1
      const currentProgress = startProgress + (1 - startProgress) * easedProgress
      setDragProgress(currentProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Animation complete, update page
        if (dragDirection === "next" && currentPage < pages.length - 1) {
          setCurrentPage(currentPage + 1)
        } else if (dragDirection === "prev" && currentPage > 0) {
          setCurrentPage(currentPage - 1)
        }

        // Reset state
        setDragProgress(0)
        setIsFlipping(false)
      }
    }

    requestAnimationFrame(animate)
  }

  const cancelTurn = () => {
    // Animate back to 0 progress
    const duration = 300 // ms
    const startTime = Date.now()
    const startProgress = dragProgress

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      const easedProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI)

      // Interpolate from current progress to 0
      const currentProgress = startProgress * (1 - easedProgress)
      setDragProgress(currentProgress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Animation complete, reset state
        setDragProgress(0)
      }
    }

    requestAnimationFrame(animate)
  }

  const toggleToolbar = () => {
    setShowToolbar(!showToolbar)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center"
          >
            <BookCover onOpen={handleOpenBook} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center"
          >
            {/* Book container */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Book shadow */}
              <div className="absolute w-[calc(100%-40px)] h-[calc(100%-40px)] max-w-5xl max-h-[80vh] bg-black/20 rounded-lg blur-xl transform translate-y-4"></div>

              {/* Book with binding */}
              <div className="relative w-full h-full max-w-5xl max-h-[80vh] md:max-h-[85vh] flex">
                {/* Left binding */}
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

                {/* Book pages container */}
                <div
                  ref={bookRef}
                  className="relative flex-1 h-full bg-white rounded-r-lg shadow-xl overflow-hidden"
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  {/* Book pages thickness effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-[15px] bg-gradient-to-r from-[#f0f0f0] to-white"></div>

                  {/* Current page */}
                  <div className="absolute inset-0">
                    {pages.length > 0 && currentPage < pages.length ? (
                      <ScrapbookPage
                        page={pages[currentPage]}
                        onUpdate={(updates) => handleUpdatePage(pages[currentPage].id, updates)}
                        selectedTool={selectedTool}
                        selectedElement={selectedElement}
                        setSelectedElement={setSelectedElement}
                        isMobile={isMobile}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-gray-400">No pages available</p>
                      </div>
                    )}
                  </div>

                  {/* Page turning effect */}
                  {dragDirection && dragProgress > 0 && (
                    <>
                      {/* The page that's being turned */}
                      <div
                        className="absolute inset-0 turning-page"
                        style={{
                          zIndex: 30,
                          transformOrigin: dragDirection === "next" ? "left center" : "right center",
                          transform: `rotateY(${dragDirection === "next" ? -dragProgress * 180 : dragProgress * 180}deg)`,
                          boxShadow: `${dragDirection === "next" ? "-" : ""}${dragProgress * 10}px 0 15px rgba(0,0,0,${0.1 + dragProgress * 0.2})`,
                        }}
                      >
                        {/* Front of turning page */}
                        <div
                          className="absolute inset-0 backface-hidden"
                          style={{
                            zIndex: 31,
                            backgroundImage: `url('/paper-texture.png')`,
                            backgroundSize: "cover",
                            backgroundBlendMode: "overlay",
                            backgroundColor: dragDirection === "next" ? "#fff5f5" : "#f5f5ff",
                          }}
                        >
                          {dragDirection === "next" ? (
                            <ScrapbookPage
                              page={pages[currentPage]}
                              onUpdate={(updates) => handleUpdatePage(pages[currentPage].id, updates)}
                              selectedTool={null}
                              selectedElement={null}
                              setSelectedElement={() => {}}
                              isMobile={isMobile}
                            />
                          ) : (
                            <ScrapbookPage
                              page={pages[currentPage - 1]}
                              onUpdate={(updates) => handleUpdatePage(pages[currentPage - 1].id, updates)}
                              selectedTool={null}
                              selectedElement={null}
                              setSelectedElement={() => {}}
                              isMobile={isMobile}
                            />
                          )}
                        </div>

                        {/* Back of turning page */}
                        <div
                          className="absolute inset-0 backface-hidden"
                          style={{
                            zIndex: 32,
                            transform: "rotateY(180deg)",
                            backgroundImage: `url('/paper-texture.png')`,
                            backgroundSize: "cover",
                            backgroundBlendMode: "overlay",
                            backgroundColor: dragDirection === "next" ? "#f5f5ff" : "#fff5f5",
                          }}
                        >
                          {dragDirection === "next" ? (
                            currentPage < pages.length - 1 && (
                              <ScrapbookPage
                                page={pages[currentPage + 1]}
                                onUpdate={(updates) => handleUpdatePage(pages[currentPage + 1].id, updates)}
                                selectedTool={null}
                                selectedElement={null}
                                setSelectedElement={() => {}}
                                isMobile={isMobile}
                              />
                            )
                          ) : (
                            <ScrapbookPage
                              page={pages[currentPage]}
                              onUpdate={(updates) => handleUpdatePage(pages[currentPage].id, updates)}
                              selectedTool={null}
                              selectedElement={null}
                              setSelectedElement={() => {}}
                              isMobile={isMobile}
                            />
                          )}
                        </div>

                        {/* Page bend effect - creates a 3D bend along the spine */}
                        <div
                          className="absolute inset-0 backface-hidden pointer-events-none"
                          style={{
                            background:
                              dragDirection === "next"
                                ? `linear-gradient(to right, rgba(0,0,0,${0.1 * dragProgress}) 0%, transparent 20%)`
                                : `linear-gradient(to left, rgba(0,0,0,${0.1 * dragProgress}) 0%, transparent 20%)`,
                            zIndex: 33,
                          }}
                        />
                      </div>

                      {/* Page fold shadow */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          zIndex: 40,
                          opacity: dragProgress * 0.7,
                          background:
                            dragDirection === "next"
                              ? `linear-gradient(to right, rgba(0,0,0,0.3) ${5 + dragProgress * 5}%, transparent ${20 + dragProgress * 20}%)`
                              : `linear-gradient(to left, rgba(0,0,0,0.3) ${5 + dragProgress * 5}%, transparent ${20 + dragProgress * 20}%)`,
                        }}
                      />

                      {/* Page curl effect */}
                      <div
                        className="absolute inset-0 pointer-events-none page-curl"
                        style={{
                          zIndex: 50,
                          opacity: dragProgress,
                          backgroundImage:
                            dragDirection === "next"
                              ? `radial-gradient(circle at left, transparent, rgba(0,0,0,0.2) ${80 - dragProgress * 30}%, transparent ${90 - dragProgress * 30}%)`
                              : `radial-gradient(circle at right, transparent, rgba(0,0,0,0.2) ${80 - dragProgress * 30}%, transparent ${90 - dragProgress * 30}%)`,
                        }}
                      />

                      {/* Dynamic page wrinkle effect */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          zIndex: 55,
                          opacity: dragProgress * 0.4,
                          backgroundImage: `url('/page-wrinkle.png')`,
                          backgroundSize: "cover",
                          backgroundPosition: dragDirection === "next" ? "left center" : "right center",
                          transform: `scaleX(${dragDirection === "next" ? 1 : -1})`,
                        }}
                      />
                    </>
                  )}

                  {/* Page turn hints */}
                  {!dragStart && !isFlipping && !selectedTool && (
                    <>
                      {currentPage > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-[20%] z-10 page-hint-left">
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/60 rounded-r-full p-2 shadow-md">
                            <div className="w-6 h-6 flex items-center justify-center text-gray-400">←</div>
                          </div>
                        </div>
                      )}

                      {currentPage < pages.length - 1 && (
                        <div className="absolute right-0 top-0 bottom-0 w-[20%] z-10 page-hint-right">
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/60 rounded-l-full p-2 shadow-md">
                            <div className="w-6 h-6 flex items-center justify-center text-gray-400">→</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Subtle page number indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white/50 rounded-full text-xs text-gray-500 z-20">
                    {currentPage + 1}/{pages.length}
                  </div>
                </div>
              </div>

              {/* Floating action buttons */}
              <div className="absolute bottom-4 right-4 flex gap-2 z-50">
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full h-10 w-10"
                  onClick={toggleToolbar}
                >
                  <Settings className="h-5 w-5" />
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full h-10 w-10"
                  onClick={handleAddPage}
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full h-10 w-10"
                  onClick={handleShareDiary}
                >
                  <Share2 className="h-5 w-5" />
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white rounded-full h-10 w-10"
                  onClick={handleSaveScrapbook}
                >
                  <Save className="h-5 w-5" />
                </Button>
              </div>

              {/* Floating toolbar */}
              <AnimatePresence>
                {showToolbar && (
                  <FloatingToolbar
                    selectedTool={selectedTool}
                    setSelectedTool={setSelectedTool}
                    selectedElement={selectedElement}
                    onUpdateElement={(updates) => {
                      if (selectedElement) {
                        const updatedPage = { ...pages[currentPage] }

                        if (selectedElement.type === "textBox") {
                          const textBoxIndex = updatedPage.textBoxes.findIndex(
                            (tb: any) => tb.id === selectedElement.id,
                          )
                          if (textBoxIndex !== -1) {
                            updatedPage.textBoxes[textBoxIndex] = {
                              ...updatedPage.textBoxes[textBoxIndex],
                              ...updates,
                            }
                          }
                        } else if (selectedElement.type === "sticker") {
                          const stickerIndex = updatedPage.stickers.findIndex((s: any) => s.id === selectedElement.id)
                          if (stickerIndex !== -1) {
                            updatedPage.stickers[stickerIndex] = {
                              ...updatedPage.stickers[stickerIndex],
                              ...updates,
                            }
                          }
                        }

                        handleUpdatePage(updatedPage.id, updatedPage)
                      }
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Share Dialog */}
              <ShareDialog isOpen={showShareDialog} onClose={() => setShowShareDialog(false)} diaryId={diaryId} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for page flipping animation */}
      <style jsx global>{`
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .turning-page {
          transform-style: preserve-3d;
          transition: box-shadow 0.3s ease;
        }
        
        .page-hint-left, .page-hint-right {
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }
        
        .page-hint-left:hover, .page-hint-right:hover {
          opacity: 1;
        }
        
        /* Cursor styles */
        .page-hint-left {
          cursor: w-resize;
        }
        
        .page-hint-right {
          cursor: e-resize;
        }
        
        .dragging-page {
          cursor: grabbing !important;
        }
        
        /* Page curl animation */
        @keyframes pulse-curl {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .page-curl {
          animation: pulse-curl 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}

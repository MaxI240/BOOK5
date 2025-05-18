"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, useDragControls } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageIcon, Trash2, Edit } from "lucide-react"
import { nanoid } from "nanoid"

interface ScrapbookPageProps {
  page: any
  onUpdate: (updates: any) => void
  selectedTool: string | null
  selectedElement: any | null
  setSelectedElement: (element: any | null) => void
  isMobile: boolean
}

export function ScrapbookPage({
  page,
  onUpdate,
  selectedTool,
  selectedElement,
  setSelectedElement,
  isMobile,
}: ScrapbookPageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(page.title || "")
  const [imageUrl, setImageUrl] = useState(page.image || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingContext, setDrawingContext] = useState<CanvasRenderingContext2D | null>(null)
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const dragControls = useDragControls()

  // Initialize canvas for drawing
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.lineJoin = "round"
        ctx.lineCap = "round"
        ctx.lineWidth = 5
        setDrawingContext(ctx)
      }
    }
  }, [canvasRef])

  // Update title when page changes
  useEffect(() => {
    setTitle(page.title || "")
    setImageUrl(page.image || "")
  }, [page])

  // Handle tool selection effects
  useEffect(() => {
    if (selectedTool === "text") {
      addTextBox()
      setSelectedElement(null)
    } else if (selectedTool === "image") {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
      setSelectedElement(null)
    } else if (selectedTool === "sticker") {
      addSticker()
      setSelectedElement(null)
    }
  }, [selectedTool])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    onUpdate({ title })
    setIsEditing(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setImageUrl(imageUrl)
        onUpdate({ image: imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const addTextBox = () => {
    const newTextBox = {
      id: nanoid(),
      text: "Click to edit text",
      x: 100,
      y: 150,
      color: "#000000",
      fontSize: 16,
      fontFamily: "Arial",
    }

    onUpdate({
      textBoxes: [...(page.textBoxes || []), newTextBox],
    })

    setSelectedElement({
      type: "textBox",
      id: newTextBox.id,
    })
  }

  const updateTextBox = (id: string, updates: any) => {
    const textBoxes = [...(page.textBoxes || [])]
    const index = textBoxes.findIndex((tb) => tb.id === id)

    if (index !== -1) {
      textBoxes[index] = {
        ...textBoxes[index],
        ...updates,
      }

      onUpdate({ textBoxes })
    }
  }

  const deleteTextBox = (id: string) => {
    const textBoxes = (page.textBoxes || []).filter((tb: any) => tb.id !== id)
    onUpdate({ textBoxes })
    setSelectedElement(null)
  }

  const addSticker = () => {
    // In a real app, you'd have a selection of stickers
    // For this example, we'll use emoji as stickers
    const stickers = ["😊", "❤️", "🌟", "🎉", "🎁", "🌈", "🦄", "🍕", "🎵"]
    const randomSticker = stickers[Math.floor(Math.random() * stickers.length)]

    const newSticker = {
      id: nanoid(),
      content: randomSticker,
      x: 150,
      y: 200,
      rotation: Math.random() * 30 - 15,
      scale: 1,
    }

    onUpdate({
      stickers: [...(page.stickers || []), newSticker],
    })

    setSelectedElement({
      type: "sticker",
      id: newSticker.id,
    })
  }

  const updateSticker = (id: string, updates: any) => {
    const stickers = [...(page.stickers || [])]
    const index = stickers.findIndex((s) => s.id === id)

    if (index !== -1) {
      stickers[index] = {
        ...stickers[index],
        ...updates,
      }

      onUpdate({ stickers })
    }
  }

  const deleteSticker = (id: string) => {
    const stickers = (page.stickers || []).filter((s: any) => s.id !== id)
    onUpdate({ stickers })
    setSelectedElement(null)
  }

  // Drawing functions
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (selectedTool !== "draw" || !drawingContext) return

    setIsDrawing(true)

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
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

    drawingContext.beginPath()
    drawingContext.moveTo(x, y)
    setLastPosition({ x, y })
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !drawingContext) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
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

    drawingContext.lineWidth = 3
    drawingContext.strokeStyle = "#9c27b0"

    drawingContext.lineTo(x, y)
    drawingContext.stroke()

    setLastPosition({ x, y })
  }

  const stopDrawing = () => {
    if (isDrawing && drawingContext) {
      drawingContext.closePath()
      setIsDrawing(false)

      // In a real app, you'd save the drawing data
      // For this example, we'll just keep it in the canvas
    }
  }

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      {/* Page background with texture */}
      <div className="absolute inset-0 bg-[#f3e5f5]"></div>
      <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-40"></div>

      {/* Paper texture and fold effect */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Page fold line */}
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#9c27b0]/30 to-transparent opacity-70"></div>

        {/* Page crease effect */}
        <div className="absolute left-[5%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#9c27b0]/20 to-transparent opacity-30"></div>

        {/* Page texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#9c27b005_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Subtle page wave effect */}
        <div className="absolute right-0 top-0 h-full w-[20%] bg-gradient-to-l from-black/[0.03] to-transparent"></div>
      </div>

      {/* Decorative corner fold */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#e1bee7]/30 to-transparent pointer-events-none">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#f3e5f5] transform origin-bottom-left rotate-6 translate-y-[-1px] translate-x-[1px]"></div>
      </div>

      {/* Page content */}
      <div className="relative z-10 h-full p-4 md:p-8 flex flex-col">
        {/* Page title with more decorative styling */}
        <div className="mb-4 md:mb-6 text-center relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-[#9c27b0]/40 via-[#673ab7]/60 to-[#9c27b0]/40 rounded-full"></div>

          {isEditing ? (
            <Input
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              className="text-xl font-bold text-center border-b-2 border-dashed border-[#9c27b0]/40 bg-transparent"
              autoFocus
            />
          ) : (
            <h2
              className="text-xl md:text-2xl font-bold text-[#4a148c] cursor-pointer hover:text-[#9c27b0] transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {title || "Click to add title"}
            </h2>
          )}

          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#9c27b0]/40 via-[#673ab7]/60 to-[#9c27b0]/40 rounded-full"></div>
        </div>

        {/* Main image with decorative frame - smaller size */}
        <div className="mb-4 md:mb-6 flex justify-center">
          {imageUrl ? (
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#9c27b0]/40 via-[#673ab7]/40 to-[#3f51b5]/40 rounded-lg opacity-70 blur-sm"></div>
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Page memory"
                className="relative max-h-32 md:max-h-40 object-contain rounded-md shadow-md border-2 border-[#e1bee7]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="h-20 w-32 md:h-24 md:w-36 border-dashed border-2 border-[#ce93d8] flex flex-col items-center justify-center gap-1 bg-white/50 hover:bg-white/70 hover:border-[#9c27b0] transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 md:h-5 md:w-5 text-[#9c27b0]" />
              <span className="text-xs md:text-sm text-[#4a148c] font-medium">Add Image</span>
            </Button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        {/* Text boxes */}
        {page.textBoxes?.map((textBox: any) => (
          <motion.div
            key={textBox.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            drag
            dragControls={dragControls}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              updateTextBox(textBox.id, {
                x: textBox.x + info.offset.x,
                y: textBox.y + info.offset.y,
              })
            }}
            style={{
              position: "absolute",
              left: textBox.x,
              top: textBox.y,
              zIndex: selectedElement?.id === textBox.id ? 10 : 1,
            }}
            onClick={() => setSelectedElement({ type: "textBox", id: textBox.id })}
            className={`${selectedElement?.id === textBox.id ? "ring-2 ring-[#9c27b0] ring-offset-2" : ""}`}
          >
            <div className="relative group">
              <Textarea
                value={textBox.text}
                onChange={(e) => updateTextBox(textBox.id, { text: e.target.value })}
                style={{
                  color: textBox.color,
                  fontSize: `${textBox.fontSize}px`,
                  fontFamily: textBox.fontFamily,
                  background: "rgba(255, 255, 255, 0.7)",
                  minWidth: isMobile ? "120px" : "150px",
                  minHeight: isMobile ? "50px" : "60px",
                  padding: "8px",
                  borderRadius: "4px",
                  resize: "both",
                }}
              />

              {selectedElement?.id === textBox.id && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-3 -right-3 h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteTextBox(textBox.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Stickers */}
        {page.stickers?.map((sticker: any) => (
          <motion.div
            key={sticker.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            drag
            dragControls={dragControls}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              updateSticker(sticker.id, {
                x: sticker.x + info.offset.x,
                y: sticker.y + info.offset.y,
              })
            }}
            style={{
              position: "absolute",
              left: sticker.x,
              top: sticker.y,
              rotate: `${sticker.rotation}deg`,
              scale: sticker.scale,
              zIndex: selectedElement?.id === sticker.id ? 10 : 1,
              fontSize: isMobile ? "2.5rem" : "3rem",
            }}
            onClick={() => setSelectedElement({ type: "sticker", id: sticker.id })}
            className={`${selectedElement?.id === sticker.id ? "ring-2 ring-[#9c27b0] ring-offset-2 rounded-full" : ""}`}
          >
            <div className="relative group cursor-move">
              <div className="select-none">{sticker.content}</div>

              {selectedElement?.id === sticker.id && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-3 -right-3 h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSticker(sticker.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Drawing canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="absolute inset-0 w-full h-full z-0 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            pointerEvents: selectedTool === "draw" ? "auto" : "none",
            cursor: selectedTool === "draw" ? "crosshair" : "default",
          }}
        />
      </div>
    </div>
  )
}

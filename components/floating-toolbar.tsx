"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Type, ImageIcon, Smile, PenTool } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useMobile } from "@/hooks/use-mobile"

interface FloatingToolbarProps {
  selectedTool: string | null
  setSelectedTool: (tool: string | null) => void
  selectedElement: any | null
  onUpdateElement: (updates: any) => void
}

export function FloatingToolbar({
  selectedTool,
  setSelectedTool,
  selectedElement,
  onUpdateElement,
}: FloatingToolbarProps) {
  const isMobile = useMobile()

  const fontFamilies = [
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times" },
    { value: "Comic Sans MS", label: "Comic" },
    { value: "Courier New", label: "Courier" },
    { value: "Georgia", label: "Georgia" },
  ]

  const colors = [
    "#000000",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#f44336",
    "#e91e63",
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`absolute ${isMobile ? "left-2 bottom-16" : "left-4 bottom-4"} z-50 bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-3 border border-white/50 ${isMobile ? "max-w-[280px]" : "max-w-xs"}`}
    >
      <Tabs defaultValue="tools">
        <TabsList className="grid grid-cols-2 bg-white/70 mb-2">
          <TabsTrigger
            value="tools"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9c27b0] data-[state=active]:to-[#673ab7] data-[state=active]:text-white"
          >
            Tools
          </TabsTrigger>
          <TabsTrigger
            value="properties"
            disabled={!selectedElement}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#673ab7] data-[state=active]:to-[#3f51b5] data-[state=active]:text-white"
          >
            Properties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="flex flex-wrap gap-2 justify-center p-2 bg-white/50 rounded-md">
          <Button
            variant={selectedTool === "text" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedTool("text")}
            title="Add Text"
            className={selectedTool === "text" ? "bg-[#9c27b0] hover:bg-[#7b1fa2]" : "bg-white/70"}
          >
            <Type className="h-4 w-4" />
          </Button>

          <Button
            variant={selectedTool === "image" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedTool("image")}
            title="Add Image"
            className={selectedTool === "image" ? "bg-[#673ab7] hover:bg-[#512da8]" : "bg-white/70"}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button
            variant={selectedTool === "sticker" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedTool("sticker")}
            title="Add Sticker"
            className={selectedTool === "sticker" ? "bg-[#3f51b5] hover:bg-[#303f9f]" : "bg-white/70"}
          >
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            variant={selectedTool === "draw" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedTool(selectedTool === "draw" ? null : "draw")}
            title="Draw"
            className={selectedTool === "draw" ? "bg-[#e91e63] hover:bg-[#c2185b]" : "bg-white/70"}
          >
            <PenTool className="h-4 w-4" />
          </Button>
        </TabsContent>

        <TabsContent value="properties" className="space-y-3 p-2">
          {selectedElement?.type === "textBox" && (
            <div className="space-y-3">
              <div>
                <Label>Font Family</Label>
                <RadioGroup
                  className="flex flex-wrap gap-2 mt-1"
                  onValueChange={(value) => onUpdateElement({ fontFamily: value })}
                >
                  {fontFamilies.map((font) => (
                    <div key={font.value} className="flex items-center space-x-1">
                      <RadioGroupItem value={font.value} id={`font-${font.value}`} />
                      <Label htmlFor={`font-${font.value}`} style={{ fontFamily: font.value }}>
                        {font.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Font Size</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    min={10}
                    max={36}
                    step={1}
                    defaultValue={[16]}
                    onValueChange={(value) => onUpdateElement({ fontSize: value[0] })}
                    className="w-full"
                  />
                  <span className="w-8 text-center text-sm">{16}</span>
                </div>
              </div>

              <div>
                <Label>Text Color</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-5 h-5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#9c27b0]"
                      style={{ backgroundColor: color }}
                      onClick={() => onUpdateElement({ color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedElement?.type === "sticker" && (
            <div className="space-y-3">
              <div>
                <Label>Rotation</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    min={-180}
                    max={180}
                    step={5}
                    defaultValue={[0]}
                    onValueChange={(value) => onUpdateElement({ rotation: value[0] })}
                    className="w-full"
                  />
                  <span className="w-10 text-center text-sm">{0}°</span>
                </div>
              </div>

              <div>
                <Label>Size</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    min={0.5}
                    max={3}
                    step={0.1}
                    defaultValue={[1]}
                    onValueChange={(value) => onUpdateElement({ scale: value[0] })}
                    className="w-full"
                  />
                  <span className="w-10 text-center text-sm">{1}x</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

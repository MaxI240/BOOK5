"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Type, ImageIcon, Smile, PenTool } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ToolbarProps {
  selectedTool: string | null
  setSelectedTool: (tool: string | null) => void
  selectedElement: any | null
  onUpdateElement: (updates: any) => void
}

export function Toolbar({ selectedTool, setSelectedTool, selectedElement, onUpdateElement }: ToolbarProps) {
  const [activeTab, setActiveTab] = useState("tools")

  const fontFamilies = [
    { value: "Arial", label: "Arial" },
    { value: "Times New Roman", label: "Times" },
    { value: "Comic Sans MS", label: "Comic" },
    { value: "Courier New", label: "Courier" },
    { value: "Georgia", label: "Georgia" },
  ]

  const colors = [
    "#000000",
    "#FF5252",
    "#FF4081",
    "#E040FB",
    "#7C4DFF",
    "#536DFE",
    "#448AFF",
    "#40C4FF",
    "#18FFFF",
    "#64FFDA",
    "#69F0AE",
    "#B2FF59",
    "#EEFF41",
    "#FFFF00",
    "#FFD740",
    "#FFAB40",
    "#FF6E40",
  ]

  return (
    <div className="mt-6 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 backdrop-blur-sm rounded-lg shadow-md p-3 border border-white/50">
      <Tabs defaultValue="tools" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 bg-white/70">
          <TabsTrigger
            value="tools"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            Tools
          </TabsTrigger>
          <TabsTrigger
            value="properties"
            disabled={!selectedElement}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
          >
            Properties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="flex flex-wrap gap-3 justify-center p-3 bg-white/50 rounded-md mt-2">
          <Button
            variant={selectedTool === "text" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedTool("text")}
            title="Add Text"
            className={selectedTool === "text" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-white/70"}
          >
            <Type className="h-4 w-4" />
          </Button>

          <Button
            variant={selectedTool === "image" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedTool("image")}
            title="Add Image"
            className={selectedTool === "image" ? "bg-gradient-to-r from-blue-500 to-teal-500" : "bg-white/70"}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button
            variant={selectedTool === "sticker" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedTool("sticker")}
            title="Add Sticker"
            className={selectedTool === "sticker" ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-white/70"}
          >
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            variant={selectedTool === "draw" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedTool(selectedTool === "draw" ? null : "draw")}
            title="Draw"
            className={selectedTool === "draw" ? "bg-gradient-to-r from-red-500 to-pink-500" : "bg-white/70"}
          >
            <PenTool className="h-4 w-4" />
          </Button>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4 p-2">
          {selectedElement?.type === "textBox" && (
            <div className="space-y-4">
              <div>
                <Label>Font Family</Label>
                <RadioGroup
                  className="flex flex-wrap gap-2 mt-2"
                  onValueChange={(value) => onUpdateElement({ fontFamily: value })}
                >
                  {fontFamilies.map((font) => (
                    <div key={font.value} className="flex items-center space-x-2">
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
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    min={10}
                    max={36}
                    step={1}
                    defaultValue={[16]}
                    onValueChange={(value) => onUpdateElement({ fontSize: value[0] })}
                    className="w-full"
                  />
                  <span className="w-8 text-center">{16}</span>
                </div>
              </div>

              <div>
                <Label>Text Color</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      style={{ backgroundColor: color }}
                      onClick={() => onUpdateElement({ color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedElement?.type === "sticker" && (
            <div className="space-y-4">
              <div>
                <Label>Rotation</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    min={-180}
                    max={180}
                    step={5}
                    defaultValue={[0]}
                    onValueChange={(value) => onUpdateElement({ rotation: value[0] })}
                    className="w-full"
                  />
                  <span className="w-12 text-center">{0}°</span>
                </div>
              </div>

              <div>
                <Label>Size</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    min={0.5}
                    max={3}
                    step={0.1}
                    defaultValue={[1]}
                    onValueChange={(value) => onUpdateElement({ scale: value[0] })}
                    className="w-full"
                  />
                  <span className="w-12 text-center">{1}x</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

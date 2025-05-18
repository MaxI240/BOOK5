"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Bug, ChevronDown, ChevronUp, Trash2 } from "lucide-react"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [diaryId, setDiaryId] = useState("")
  const [savedDiaries, setSavedDiaries] = useState<string[]>([])

  // Load saved diaries from localStorage
  const loadSavedDiaries = () => {
    const diaries: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("scrapbook-")) {
        diaries.push(key.replace("scrapbook-", ""))
      }
    }
    setSavedDiaries(diaries)
  }

  // View a saved diary
  const viewDiary = (id: string) => {
    window.location.href = `${window.location.origin}${window.location.pathname}?diary=${id}`
  }

  // Delete a saved diary
  const deleteDiary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.removeItem(`scrapbook-${id}`)
    loadSavedDiaries()
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="fixed bottom-4 left-4 z-50 w-80 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200"
    >
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center justify-between w-full p-2">
          <div className="flex items-center">
            <Bug className="h-4 w-4 mr-2" />
            <span>Debug Panel</span>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="diary-id">Enter Diary ID to View</Label>
          <div className="flex space-x-2">
            <Input
              id="diary-id"
              value={diaryId}
              onChange={(e) => setDiaryId(e.target.value)}
              placeholder="Enter diary ID"
            />
            <Button onClick={() => viewDiary(diaryId)} disabled={!diaryId}>
              View
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Saved Diaries</Label>
            <Button variant="ghost" size="sm" onClick={loadSavedDiaries}>
              Refresh
            </Button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
            {savedDiaries.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No saved diaries found. Click refresh to check again.</p>
            ) : (
              savedDiaries.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => viewDiary(id)}
                >
                  <span className="text-sm font-mono truncate">{id}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => deleteDiary(id, e)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  diaryId: string
}

export function ShareDialog({ isOpen, onClose, diaryId }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareUrl = `${window.location.origin}${window.location.pathname}?diary=${diaryId}`

  const copyToClipboard = async () => {
    try {
      // Create the full share URL with the diary ID
      const shareUrl = `${window.location.origin}${window.location.pathname}?diary=${diaryId}`

      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the link manually.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your diary</DialogTitle>
          <DialogDescription>Anyone with this link will be able to view your diary.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="share-link">Share Link</Label>
            <div className="flex items-center">
              <Input id="share-link" value={shareUrl} readOnly className="flex-1 mr-2" />
              <Button size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="bg-[#f3e5f5] p-3 rounded-md">
            <p className="text-sm text-[#4a148c]">
              <strong>Note:</strong> In this demo, diaries are stored in your browser's local storage. In a real app,
              they would be saved to a database and accessible from any device.
            </p>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              window.open(shareUrl, "_blank")
            }}
          >
            Test Link
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

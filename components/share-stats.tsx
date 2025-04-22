"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Check, Copy, Download, Facebook, Share2, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ShareStatsProps {
  stats: {
    watchTime: number
    videosWatched: number
    topCategory: string
    topCreator: string
  }
  iconOnly?: boolean
  trigger?: React.ReactNode
}

export function ShareStats({ stats, iconOnly = true, trigger }: ShareStatsProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrl = `https://youtube-wrapped.vercel.app/share?wt=${stats.watchTime}&vw=${stats.videosWatched}&tc=${encodeURIComponent(stats.topCategory)}&cr=${encodeURIComponent(stats.topCreator)}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    // In a real app, this would generate an actual image
    // For now, we'll just show a toast
    toast({
      title: "Stats image downloaded!",
      description: "Your YouTube Wrapped stats have been downloaded",
    })
    setOpen(false)
  }

  const handleShareSocial = (platform: string) => {
    // In a real app, this would open the respective sharing dialog
    toast({
      title: `Shared on ${platform}!`,
      description: `Your stats have been shared on ${platform}`,
    })
    setOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button size="sm" variant="outline" className={iconOnly ? "w-9 px-0" : "gap-2"}>
              <Share2 className="h-4 w-4" />
              {!iconOnly && <span>Share My Stats</span>}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share your YouTube Wrapped</DialogTitle>
            <DialogDescription>Share your viewing stats with friends or download as an image</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="preview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="share">Share Options</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="pt-4">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                    <Image
                      src="/placeholder.svg?height=64&width=64"
                      alt="YouTube Wrapped"
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-bold">My 2023 YouTube Wrapped</h3>
                  <div className="grid w-full grid-cols-2 gap-4">
                    <div className="rounded-md bg-muted p-3 text-center">
                      <p className="text-sm text-muted-foreground">Watch Time</p>
                      <p className="text-2xl font-bold">{stats.watchTime} hrs</p>
                    </div>
                    <div className="rounded-md bg-muted p-3 text-center">
                      <p className="text-sm text-muted-foreground">Videos</p>
                      <p className="text-2xl font-bold">{stats.videosWatched}</p>
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm">Top Category</p>
                      <p className="text-sm font-medium">{stats.topCategory}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Top Creator</p>
                      <p className="text-sm font-medium">{stats.topCreator}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="share" className="space-y-4 pt-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 rounded-md border p-2">
                    <p className="truncate text-sm">{shareUrl}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex justify-center space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90"
                    onClick={() => handleShareSocial("Twitter")}
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Share on Twitter</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
                    onClick={() => handleShareSocial("Facebook")}
                  >
                    <Facebook className="h-4 w-4" />
                    <span className="sr-only">Share on Facebook</span>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download image</span>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="sm:justify-start">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}

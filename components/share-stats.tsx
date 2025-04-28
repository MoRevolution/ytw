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
import { toast } from "@/hooks/use-toast"
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
  profilePicUrl?: string
}

export function ShareStats({ stats, iconOnly = true, trigger, profilePicUrl }: ShareStatsProps) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  
  const handleDownload = async () => {
    // Detect theme
    let isDark = false;
    if (typeof window !== 'undefined') {
      isDark = document.documentElement.classList.contains('dark');
    }

    // Get previous year
    const prevYear = new Date().getFullYear() - 1;

    // Set theme colors
    const bgColor = isDark ? '#18181b' : '#fff';
    const cardColor = isDark ? '#27272a' : '#f3f4f6';
    const textColor = isDark ? '#fff' : '#18181b';
    const subTextColor = isDark ? '#a1a1aa' : '#52525b';
    const placeholderColor = isDark ? '#e5e7eb' : '#d1d5db';

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 480;

    // Draw background with rounded corners
    const radius = 20;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(canvas.width - radius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    ctx.lineTo(canvas.width, canvas.height - radius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
    ctx.lineTo(radius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw profile picture (centered at top)
    const profileSize = 64;
    const profileX = canvas.width / 2 - profileSize / 2;
    const profileY = 28;
    const drawProfile = (img: HTMLImageElement) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, profileX, profileY, profileSize, profileSize);
      ctx.restore();
    };
    // Draw placeholder circle if no image
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = placeholderColor;
    ctx.fill();
    ctx.restore();

    // Draw title
    ctx.fillStyle = textColor;
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`My ${prevYear} YouTube Wrapped`, canvas.width / 2, 130);

    // Draw stat boxes
    const boxY = 160;
    const boxHeight = 80;
    const boxWidth = 170;
    // Watch Time box
    ctx.save();
    ctx.fillStyle = cardColor;
    ctx.beginPath();
    ctx.roundRect(40, boxY, boxWidth, boxHeight, 12);
    ctx.fill();
    ctx.restore();
    // Videos box
    ctx.save();
    ctx.fillStyle = cardColor;
    ctx.beginPath();
    ctx.roundRect(190, boxY, boxWidth, boxHeight, 12);
    ctx.fill();
    ctx.restore();
    // Watch Time text
    ctx.fillStyle = subTextColor;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Watch Time', 40 + boxWidth / 2, boxY + 28);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`${stats.watchTime} hrs`, 40 + boxWidth / 2, boxY + 60);
    // Videos text
    ctx.fillStyle = subTextColor;
    ctx.font = '16px Arial';
    ctx.fillText('Videos', 190 + boxWidth / 2, boxY + 28);
    ctx.fillStyle = textColor;
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`${stats.videosWatched}`, 190 + boxWidth / 2, boxY + 60);

    // Bottom stats (category/creator)
    ctx.font = '16px Arial';
    ctx.fillStyle = subTextColor;
    ctx.textAlign = 'left';
    ctx.fillText('Top Category', 40, 290);
    ctx.fillText('Top Creator', 40, 330);
    ctx.textAlign = 'right';
    ctx.fillStyle = textColor;
    ctx.font = 'bold 16px Arial';
    ctx.fillText(stats.topCategory, canvas.width - 40, 290);
    ctx.fillText(stats.topCreator, canvas.width - 40, 330);

    // Download logic after profile image loads
    const downloadImage = () => {
      const link = document.createElement('a');
      link.download = 'youtube-wrapped-stats.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({
        title: "Stats image downloaded!",
        description: "Your YouTube Wrapped stats have been downloaded",
      });
      setOpen(false);
    };
    if (profilePicUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        drawProfile(img);
        downloadImage();
      };
      img.onerror = downloadImage;
      img.src = profilePicUrl;
    } else {
      downloadImage();
    }
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                  <h3 className="text-xl font-bold">My {new Date().getFullYear() - 1} YouTube Wrapped</h3>
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
              <div className="flex flex-col space-y-4">
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-[#1DA1F2] text-white hover:bg-[#1DA1F2]/90"
                    onClick={() => {
                      handleDownload()
                      window.open(`https://twitter.com/intent/tweet?text=Check out my YouTube Wrapped stats!`, '_blank')
                    }}
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Share on Twitter</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white hover:opacity-90"
                    onClick={() => {
                      handleDownload()
                      window.open(`https://www.instagram.com/`, '_blank')
                    }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="sr-only">Share on Instagram</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full" 
                    onClick={handleDownload}
                  >
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

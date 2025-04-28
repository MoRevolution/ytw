"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Clock } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { CreatorStats } from "@/lib/fetch-creators-data"
import { getChannelThumbnailCached } from "@/lib/youtube-api"

interface CreatorCardProps {
  creator: CreatorStats
  rank: number
  maxWatchTime: number
  comparisonCreator?: CreatorStats
}

export function CreatorCard({ creator, rank, maxWatchTime, comparisonCreator }: CreatorCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('/placeholder.svg?height=40&width=40')
  const progressValue = (creator.watchTime / maxWatchTime) * 100

  useEffect(() => {
    async function loadThumbnail() {
      if (creator.channelId) {
        const url = await getChannelThumbnailCached(creator.channelId)
        setThumbnailUrl(url)
      }
    }
    loadThumbnail()
  }, [creator.channelId])

  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={`${creator.name} avatar`}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">{creator.name}</p>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{creator.watchTime.toFixed(1)} hours</span>
          </div>
        </div>
        <Progress value={progressValue} className="mt-2 h-2" />
        {comparisonCreator && (
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{comparisonCreator.watchTime.toFixed(1)} hours last year</span>
            <span className={creator.watchTime > comparisonCreator.watchTime ? "text-green-500" : "text-red-500"}>
              {Math.round(((creator.watchTime - comparisonCreator.watchTime) / comparisonCreator.watchTime) * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
} 
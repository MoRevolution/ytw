"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Progress } from "@/components/ui/progress";
import { CreatorStats } from "@/lib/fetch-dashboard-data";
import { getChannelThumbnailCached } from "@/lib/youtube-api";

interface CreatorCardProps {
  creator: CreatorStats;
  rank: number;
  maxWatchTime: number;
  comparisonCreator?: CreatorStats;
  showNormalized?: boolean;
}

export function CreatorCard({
  creator,
  rank,
  maxWatchTime,
  comparisonCreator,
  showNormalized = false,
}: CreatorCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    "/placeholder.svg?height=40&width=40",
  );

  const displayValue = showNormalized
    ? creator.normalizedScore || 0
    : creator.watchTime;
  const progressValue = (displayValue / maxWatchTime) * 100;

  useEffect(() => {
    async function loadThumbnail() {
      if (creator.channelId) {
        const url = await getChannelThumbnailCached(creator.channelId);
        setThumbnailUrl(url);
      }
    }
    loadThumbnail();
  }, [creator.channelId]);

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
        <Image
          src={thumbnailUrl}
          alt={`${creator.name} avatar`}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium truncate">{creator.name}</p>
          <span className="text-sm text-muted-foreground ml-2">
            {showNormalized
              ? `${displayValue.toFixed(1)} score`
              : `${creator.watchTime.toFixed(1)}h`}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={progressValue} className="flex-1 h-2" />
          {comparisonCreator && !showNormalized && (
            <span
              className={`text-xs font-medium w-12 text-right ${creator.watchTime > comparisonCreator.watchTime ? "text-green-500" : "text-red-500"}`}
            >
              {Math.round(
                ((creator.watchTime - comparisonCreator.watchTime) /
                  comparisonCreator.watchTime) *
                  100,
              )}
              %
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

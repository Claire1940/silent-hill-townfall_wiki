"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  title: string;
  videoUrl: string;
  watchUrl: string;
  posterSrc: string;
}

export function VideoFeature({
  title,
  videoUrl,
  watchUrl,
  posterSrc,
}: VideoFeatureProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const embedUrl = useMemo(() => videoUrl, [videoUrl]);

  return (
    <div className="space-y-4">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {!isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 h-full w-full cursor-pointer"
            aria-label={`Play ${title}`}
          >
            <img
              src={posterSrc}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-xl transition-transform duration-300 hover:scale-105">
                <Play className="ml-1 h-8 w-8 fill-current" />
              </span>
            </div>
          </button>
        ) : (
          <video
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            poster={posterSrc}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          View official source
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

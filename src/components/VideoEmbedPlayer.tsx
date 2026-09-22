"use client";

import React, { useState } from "react";
import { parseVideoUrl } from "@/lib/video-parser";
import { ExternalLink, AlertCircle } from "lucide-react";

interface VideoEmbedPlayerProps {
  url: string;
  title: string;
  description?: string | null;
}

export function VideoEmbedPlayer({
  url,
  title,
  description,
}: VideoEmbedPlayerProps) {
  const [hasError, setHasError] = useState(false);
  const parsed = parseVideoUrl(url);

  return (
    <div className="flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs hover:border-zinc-300 transition">
      {/* Header */}
      <div className="p-3.5 flex items-start justify-between gap-3 border-b border-zinc-100 bg-zinc-50/60">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-200/80 text-zinc-700">
              {parsed.type}
            </span>
            <h4 className="text-xs font-semibold text-zinc-900 truncate">{title}</h4>
          </div>
          {description && (
            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{description}</p>
          )}
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100 transition flex-shrink-0"
          title="Open original video"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Player Area */}
      <div className="relative w-full bg-black flex items-center justify-center min-h-[220px] aspect-video">
        {hasError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400 text-xs">
            <AlertCircle className="w-6 h-6 text-zinc-400 mb-2" />
            <p className="text-zinc-300">Video preview unavailable</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-xs text-white underline"
            >
              Open link directly &rarr;
            </a>
          </div>
        ) : parsed.type === "youtube" && parsed.embedUrl ? (
          <iframe
            src={parsed.embedUrl}
            title={title}
            className="w-full h-full absolute inset-0 border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : parsed.type === "vimeo" && parsed.embedUrl ? (
          <iframe
            src={parsed.embedUrl}
            title={title}
            className="w-full h-full absolute inset-0 border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : parsed.type === "loom" && parsed.embedUrl ? (
          <iframe
            src={parsed.embedUrl}
            title={title}
            className="w-full h-full absolute inset-0 border-0"
            allowFullScreen
          />
        ) : parsed.type === "tiktok" && parsed.embedUrl ? (
          <iframe
            src={parsed.embedUrl}
            title={title}
            className="w-full h-full absolute inset-0 border-0"
            allowFullScreen
          />
        ) : parsed.directUrl ? (
          <video
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-contain max-h-[360px]"
            onError={() => setHasError(true)}
          >
            <source src={parsed.directUrl} />
            Your browser does not support this video format.
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition inline-flex items-center gap-1.5"
            >
              Watch Video <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

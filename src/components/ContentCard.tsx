"use client";

import { useState } from "react";
import VideoEmbed from "./VideoEmbed";
import SoundEmbed from "./SoundEmbed";
import TextEmbed from "./TextEmbed";
import type { ContentItem } from "./ContentGrid";

const platformMeta: Record<string, { label: string; color: string }> = {
  youtube: { label: "YouTube", color: "bg-red-100 text-red-700" },
  soundcloud: { label: "صوتيات", color: "bg-orange-100 text-orange-700" },
  instagram: { label: "Instagram", color: "bg-pink-100 text-pink-700" },
};

const typeIcons: Record<string, string> = {
  video: "🎬",
  sound: "🎵",
  text: "📝",
};

export default function ContentCard({ item }: { item: ContentItem }) {
  const [expanded, setExpanded] = useState(false);
  const platform = platformMeta[item.platform] || {
    label: item.platform,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
      {/* Clickable preview area */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 w-full flex items-center justify-center group"
      >
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover absolute inset-0"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl opacity-40">{typeIcons[item.type]}</span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md text-gray-700 group-hover:scale-110 transition-transform">
            {expanded ? "−" : "▶"}
          </div>
        </div>
      </button>

      {/* Expandable embed */}
      {expanded && (
        <div className="border-b">
          {item.type === "video" && (
            <VideoEmbed url={item.embedUrl} title={item.title} />
          )}
          {item.type === "sound" && (
            <SoundEmbed url={item.embedUrl} title={item.title} />
          )}
          {item.type === "text" && <TextEmbed item={item} />}
        </div>
      )}

      {/* Metadata */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`px-2 py-0.5 rounded-full font-medium ${platform.color}`}
          >
            {platform.label}
          </span>
          <span className="text-gray-400">{item.date}</span>
        </div>

        <h3 className="font-semibold text-gray-900 leading-tight">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium pt-1"
        >
          Open on {platform.label} ↗
        </a>
      </div>
    </div>
  );
}

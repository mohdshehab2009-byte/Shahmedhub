"use client";

import { useMemo } from "react";
import Fuse from "fuse.js";
import { useSearch } from "@/app/search-context";
import ContentCard from "./ContentCard";

export interface ContentItem {
  id: string;
  title: string;
  type: "video" | "sound" | "text";
  platform: string;
  url: string;
  embedUrl: string;
  thumbnail?: string;
  date: string;
  tags: string[];
  description?: string;
  body?: string;
}

const fuseOptions = {
  keys: [
    { name: "title", weight: 2 },
    { name: "description", weight: 1 },
    { name: "tags", weight: 1.5 },
    { name: "body", weight: 1 },
  ],
  threshold: 0.4,
};

export default function ContentGrid({ items }: { items: ContentItem[] }) {
  const { query } = useSearch();

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const fuse = new Fuse(items, fuseOptions);
    return fuse.search(query).map((r) => r.item);
  }, [query, items]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No results found for &quot;{query}&quot;</p>
        <p className="text-sm mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}

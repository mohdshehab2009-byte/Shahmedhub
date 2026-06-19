import ContentGrid from "@/components/ContentGrid";
import type { ContentItem } from "@/components/ContentGrid";
import raw from "@/data/generated-content.json";

const content = raw as { items: ContentItem[] };

export default function VideoPage() {
  const items = content.items.filter((i) => i.type === "video");
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">فيديو</h1>
        <p className="text-gray-600 mt-1">{items.length} فيديو</p>
      </div>
      <ContentGrid items={items} />
    </div>
  );
}

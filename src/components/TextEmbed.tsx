import type { ContentItem } from "./ContentGrid";

export default function TextEmbed({ item }: { item: ContentItem }) {
  return (
    <div className="p-4 space-y-4">
      {item.platform === "instagram" && (
        <div className="flex justify-center">
          <iframe
            src={item.embedUrl}
            title={item.title}
            className="w-full max-w-[400px]"
            style={{ height: 480 }}
            loading="lazy"
            allowTransparency
          />
        </div>
      )}

      {item.body && (
        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {item.body}
        </div>
      )}

      {!item.body && item.platform !== "instagram" && (
        <p className="text-sm text-gray-500 italic">
          No preview available.
        </p>
      )}
    </div>
  );
}

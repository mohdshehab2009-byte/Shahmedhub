export default function SoundEmbed({
  url,
  title,
  height = 166,
}: {
  url: string;
  title: string;
  height?: number;
}) {
  return (
    <div className="w-full">
      <iframe
        src={url}
        title={title}
        className="w-full"
        style={{ height }}
        allow="encrypted-media"
        loading="lazy"
      />
    </div>
  );
}

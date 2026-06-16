export default function VideoEmbed({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  return (
    <div className="aspect-video">
      <iframe
        src={url}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
}

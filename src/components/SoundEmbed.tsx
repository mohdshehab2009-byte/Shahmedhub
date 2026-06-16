export default function SoundEmbed({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  return (
    <div className="w-full">
      <iframe
        src={url}
        title={title}
        className="w-full h-[166px]"
        allow="encrypted-media"
        loading="lazy"
      />
    </div>
  );
}

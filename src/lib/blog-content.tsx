export function BlogContent({ content }: { content: string }) {
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className="leading-relaxed">
          {paragraph.split("\n").map((line, j, lines) => (
            <span key={j}>
              {line}
              {j < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

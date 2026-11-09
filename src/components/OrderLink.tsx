export function OrderLink({
  url,
  className,
  children,
}: {
  url: string | null;
  className?: string;
  children?: React.ReactNode;
}) {
  if (!url) return null;
  return (
    <a className={className} href={url} target="_blank" rel="noopener noreferrer">
      {children ?? "Order"}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

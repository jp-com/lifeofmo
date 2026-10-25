export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand-mark ${light ? "brand-light" : ""}`}>
      <img src="/assets/wordmark.webp" alt="Life of Mo" width="1254" height="1254" />
    </span>
  );
}

export function Arrow({ direction = "up-right", className = "" }: { direction?: "up-right" | "right" | "down" | "left"; className?: string }) {
  const rotation = { "up-right": 0, right: 45, down: 135, left: 225 }[direction];
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ rotate: `${rotation}deg` }}>
      <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

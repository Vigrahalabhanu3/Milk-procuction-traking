export default function Loading() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      role="progressbar"
      aria-label="Loading page"
    >
      <div className="h-1 bg-gradient-to-r from-[#0B5D3B] via-[#3A8F3D] to-[#F4C95D] animate-pulse w-full shadow-xs" />
    </div>
  );
}

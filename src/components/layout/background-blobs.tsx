export function BackgroundBlobs() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Top-left — soft coral/peach */}
      <div
        className="absolute -left-24 -top-24 h-[500px] w-[500px] rounded-full blur-3xl opacity-[0.18] dark:opacity-[0.07]"
        style={{ background: "#F2AFA8" }}
      />

      {/* Top-right — lavender */}
      <div
        className="absolute -right-20 top-[6%] h-[440px] w-[440px] rounded-full blur-3xl opacity-[0.14] dark:opacity-[0.06]"
        style={{ background: "#C9B6E4" }}
      />

      {/* Center-left — mint */}
      <div
        className="absolute -left-14 top-[42%] h-[360px] w-[360px] rounded-full blur-3xl opacity-[0.12] dark:opacity-[0.05]"
        style={{ background: "#A8E6CF" }}
      />

      {/* Center-right — sky blue */}
      <div
        className="absolute -right-28 top-[34%] h-[440px] w-[440px] rounded-full blur-3xl opacity-[0.12] dark:opacity-[0.05]"
        style={{ background: "#A8C8FF" }}
      />

      {/* Bottom-left — warm yellow */}
      <div
        className="absolute -left-20 bottom-[3%] h-[380px] w-[380px] rounded-full blur-3xl opacity-[0.13] dark:opacity-[0.05]"
        style={{ background: "#F5D9A0" }}
      />

      {/* Bottom-right — rose */}
      <div
        className="absolute -right-16 -bottom-20 h-[460px] w-[460px] rounded-full blur-3xl opacity-[0.15] dark:opacity-[0.06]"
        style={{ background: "#F2B8B5" }}
      />

      {/* Small accent — center top */}
      <div
        className="absolute left-[28%] top-[14%] h-[240px] w-[240px] rounded-full blur-2xl opacity-[0.09] dark:opacity-[0.04]"
        style={{ background: "#D4B8E8" }}
      />

      {/* Small accent — bottom center */}
      <div
        className="absolute left-[48%] bottom-[16%] h-[260px] w-[260px] rounded-full blur-2xl opacity-[0.08] dark:opacity-[0.04]"
        style={{ background: "#B8D4F0" }}
      />
    </div>
  );
}

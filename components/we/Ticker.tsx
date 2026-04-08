"use client";

/**
 * we.wesw.kr 상단 ticker 바
 * - 브랜드 컬러 #FF6B00 배경
 * - "수원의 가능성. 정희윤" 문구가 좌측으로 자동 흐름
 * - hover 시 일시정지
 */
export default function Ticker() {
  const text = "수원의 가능성, 수원시장 예비후보 정희윤";
  // 흐름이 끊기지 않도록 문구를 충분히 반복
  const items = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div
      className="w-full overflow-hidden bg-[#FF6B00] text-white"
      role="marquee"
      aria-label={text}
    >
      <div className="ticker-track flex whitespace-nowrap py-2 text-sm font-semibold tracking-wide">
        {items.map((i) => (
          <span key={i} className="mx-6 shrink-0">
            {text}
          </span>
        ))}
        {/* 무한 루프를 위한 복제 */}
        {items.map((i) => (
          <span key={`dup-${i}`} className="mx-6 shrink-0" aria-hidden="true">
            {text}
          </span>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 30s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

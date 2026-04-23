"use client";

import { useMemo, useState } from "react";
import {
  GU_LIST,
  DONG_LIST,
  SUWON_VIEWBOX,
  type SuwonGuCode,
} from "@/data/suwon-map-data";

// ───── Props ─────

export type RegionPledgeSummary = {
  gu_code: string;
  has_content: boolean;
};

type Props = {
  regionPledges: RegionPledgeSummary[];
  onGuClick: (gu_code: SuwonGuCode, gu_name: string) => void;
  onDongClick: (gu_code: SuwonGuCode, dong_name: string) => void;
};

// 드릴다운 시 확대 viewBox padding (SVG 단위)
const ZOOM_PADDING = 40;

export default function SuwonMap({
  regionPledges,
  onGuClick,
  onDongClick,
}: Props) {
  const [selectedGu, setSelectedGu] = useState<SuwonGuCode | null>(null);
  const [hoveredGu, setHoveredGu] = useState<SuwonGuCode | null>(null);
  const [hoveredDong, setHoveredDong] = useState<string | null>(null);

  // gu_code → has_content
  const hasContentByGu = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const p of regionPledges) m.set(p.gu_code, p.has_content);
    return m;
  }, [regionPledges]);

  // gu_code → 색상
  const colorByGu = useMemo(() => {
    const m = new Map<SuwonGuCode, string>();
    for (const g of GU_LIST) m.set(g.gu_code, g.color);
    return m;
  }, []);

  // 선택된 구의 동 목록과 확대 viewBox
  const guDongs = useMemo(
    () =>
      selectedGu
        ? DONG_LIST.filter((d) => d.gu_code === selectedGu)
        : [],
    [selectedGu]
  );

  const zoomedViewBox = useMemo(() => {
    if (!selectedGu || guDongs.length === 0) return null;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const d of guDongs) {
      if (d.minX < minX) minX = d.minX;
      if (d.minY < minY) minY = d.minY;
      if (d.maxX > maxX) maxX = d.maxX;
      if (d.maxY > maxY) maxY = d.maxY;
    }
    const x = minX - ZOOM_PADDING;
    const y = minY - ZOOM_PADDING;
    const w = maxX - minX + ZOOM_PADDING * 2;
    const h = maxY - minY + ZOOM_PADDING * 2;
    return `${x} ${y} ${w} ${h}`;
  }, [selectedGu, guDongs]);

  // ───── 드릴다운 뷰 ─────
  if (selectedGu && zoomedViewBox) {
    const currentGuName =
      GU_LIST.find((g) => g.gu_code === selectedGu)?.gu_name ?? "";
    const hasContent = hasContentByGu.get(selectedGu) ?? false;

    return (
      <div className="relative w-full">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedGu(null);
              setHoveredDong(null);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-800 shadow-sm hover:bg-gray-50"
          >
            ← 전체 보기
          </button>
          <span className="rounded-md bg-[#FF6B00] px-3 py-1 text-xs font-bold text-white">
            {currentGuName}
          </span>
        </div>

        <svg
          viewBox={zoomedViewBox}
          role="img"
          aria-label={`${currentGuName} 행정동 지도`}
          style={{
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
            display: "block",
            background: "rgba(255,107,0,0.04)",
            borderRadius: 12,
          }}
        >
          {guDongs.map((dong) => {
            const baseFill = hasContent ? "#FF6B00" : "#FFE0C0";
            const isHover = hoveredDong === dong.adm_cd2;
            return (
              <g
                key={dong.adm_cd2}
                onMouseEnter={() => setHoveredDong(dong.adm_cd2)}
                onMouseLeave={() => setHoveredDong(null)}
                onClick={() => onDongClick(selectedGu, dong.dong_name)}
                style={{ cursor: "pointer" }}
              >
                <path
                  d={dong.d}
                  fill={baseFill}
                  fillOpacity={isHover ? 0.8 : 1}
                  stroke="white"
                  strokeWidth={1}
                  style={{ transition: "fill-opacity 150ms ease" }}
                />
              </g>
            );
          })}

          {/* 동 라벨 (path 위에 오버레이) */}
          {guDongs.map((dong) => (
            <text
              key={`${dong.adm_cd2}-label`}
              x={dong.cx}
              y={dong.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill="#333"
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {dong.dong_name}
            </text>
          ))}
        </svg>
      </div>
    );
  }

  // ───── 전체 구 뷰 ─────
  return (
    <div className="relative w-full">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-[#FF6B00] px-3 py-1 text-xs font-bold text-white">
          수원특례시
        </span>
        <span className="text-xs text-gray-500">
          구를 클릭하면 행정동 단위로 확대됩니다.
        </span>
      </div>

      <svg
        viewBox={SUWON_VIEWBOX}
        role="img"
        aria-label="수원특례시 4개 구 지도"
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto",
          display: "block",
          background: "rgba(255,107,0,0.04)",
          borderRadius: 12,
        }}
      >
        {/* 구 단위로 묶어서 hover/click을 구 전체로 처리 */}
        {GU_LIST.map((gu) => {
          const dongs = DONG_LIST.filter((d) => d.gu_code === gu.gu_code);
          const color = colorByGu.get(gu.gu_code) ?? "#FF6B00";
          const hasContent = hasContentByGu.get(gu.gu_code) ?? false;
          const isHover = hoveredGu === gu.gu_code;
          // 공약 없는 구: opacity 0.5 / 있는 구: hover 시 약간 밝게
          const groupOpacity = hasContent ? (isHover ? 0.85 : 1) : 0.5;

          return (
            <g
              key={gu.gu_code}
              onMouseEnter={() => setHoveredGu(gu.gu_code)}
              onMouseLeave={() => setHoveredGu(null)}
              onClick={() => {
                setSelectedGu(gu.gu_code);
                onGuClick(gu.gu_code, gu.gu_name);
              }}
              style={{
                cursor: "pointer",
                opacity: groupOpacity,
                transition: "opacity 150ms ease",
              }}
            >
              {dongs.map((dong) => (
                <path
                  key={dong.adm_cd2}
                  d={dong.d}
                  fill={color}
                  stroke="white"
                  strokeWidth={0.5}
                  style={{ transition: "fill 150ms ease" }}
                />
              ))}
            </g>
          );
        })}

        {/* 구 라벨 */}
        {GU_LIST.map((gu) => (
          <text
            key={`${gu.gu_code}-label`}
            x={gu.label_x}
            y={gu.label_y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={16}
            fontWeight={700}
            fill="white"
            style={{
              pointerEvents: "none",
              userSelect: "none",
              paintOrder: "stroke",
              stroke: "rgba(0,0,0,0.25)",
              strokeWidth: 3,
            }}
          >
            {gu.gu_name}
          </text>
        ))}
      </svg>
    </div>
  );
}

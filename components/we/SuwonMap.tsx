"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { FeatureCollection, Geometry } from "geojson";

// ───── 타입 ─────

export type SuwonRegion = {
  gu_code: "jangan" | "gwonseon" | "paldal" | "yeongtong";
  gu_name: string;
  dong_name: string;
  adm_cd2: string;
  geojson: Geometry;
  has_pledge: boolean;
};

type Props = {
  regions: SuwonRegion[];
  onDongClick: (adm_cd2: string, dong_name: string, gu_name: string) => void;
};

// 구별 기본 색상 (1단계 뷰)
const GU_COLORS: Record<SuwonRegion["gu_code"], string> = {
  jangan: "#FF6B00",
  gwonseon: "#FF8C42",
  paldal: "#FFB347",
  yeongtong: "#FFC680",
};

const GU_LIST: Array<{ code: SuwonRegion["gu_code"]; name: string }> = [
  { code: "jangan", name: "장안구" },
  { code: "gwonseon", name: "권선구" },
  { code: "paldal", name: "팔달구" },
  { code: "yeongtong", name: "영통구" },
];

const VIEW_SIZE = 600; // viewBox 기준 한 변

// ───── 컴포넌트 ─────

export default function SuwonMap({ regions, onDongClick }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [mode, setMode] = useState<"gu" | "dong">("gu");
  const [selectedGu, setSelectedGu] = useState<SuwonRegion["gu_code"] | null>(
    null
  );
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  // 1단계 뷰용 FeatureCollection: 구 단위로 묶어서 각 구에 속한 동 경계를 하나로 표시
  // (d3.geoPath 자체가 MultiPolygon/ FeatureCollection 모두 렌더 가능)
  const guLayers = useMemo(() => {
    const byGu = new Map<SuwonRegion["gu_code"], SuwonRegion[]>();
    for (const r of regions) {
      const arr = byGu.get(r.gu_code) ?? [];
      arr.push(r);
      byGu.set(r.gu_code, arr);
    }
    return GU_LIST.map((g) => ({
      code: g.code,
      name: g.name,
      dongs: byGu.get(g.code) ?? [],
    }));
  }, [regions]);

  // 전체 FeatureCollection (1단계 fitSize용)
  const allFc = useMemo<FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: regions.map((r) => ({
        type: "Feature",
        properties: { adm_cd2: r.adm_cd2 },
        geometry: r.geojson,
      })),
    };
  }, [regions]);

  // 선택된 구의 FeatureCollection (2단계 fitSize용)
  const selectedFc = useMemo<FeatureCollection | null>(() => {
    if (!selectedGu) return null;
    const list = regions.filter((r) => r.gu_code === selectedGu);
    return {
      type: "FeatureCollection",
      features: list.map((r) => ({
        type: "Feature",
        properties: { adm_cd2: r.adm_cd2 },
        geometry: r.geojson,
      })),
    };
  }, [regions, selectedGu]);

  // ───── D3 렌더 (모드/선택/데이터 변경 시) ─────

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || regions.length === 0) return;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const root = svg.append("g").attr("class", "root");

    // 프로젝션
    const projection = d3.geoMercator();
    const path = d3.geoPath(projection);

    if (mode === "gu") {
      projection.fitSize([VIEW_SIZE, VIEW_SIZE - 40], allFc);

      // 각 구를 FeatureCollection으로 합쳐서 단일 path로 그려 "union" 느낌을 냄
      // (서로 다른 동끼리는 MultiPolygon으로 묶임)
      const guGroups = root
        .selectAll<SVGGElement, (typeof guLayers)[number]>("g.gu")
        .data(guLayers, (d) => d.code)
        .enter()
        .append("g")
        .attr("class", "gu")
        .style("cursor", "pointer");

      guGroups.each(function (layer) {
        const fc: FeatureCollection = {
          type: "FeatureCollection",
          features: layer.dongs.map((r) => ({
            type: "Feature",
            properties: { adm_cd2: r.adm_cd2 },
            geometry: r.geojson,
          })),
        };

        const g = d3.select(this);
        g.append("path")
          .attr("d", path(fc) ?? "")
          .attr("fill", GU_COLORS[layer.code])
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .style("transition", "fill 150ms ease")
          .on("mouseenter", function () {
            d3.select(this).attr("fill", brighten(GU_COLORS[layer.code], 0.12));
          })
          .on("mouseleave", function () {
            d3.select(this).attr("fill", GU_COLORS[layer.code]);
          });

        // 구 중앙 라벨
        const centroid = path.centroid(fc);
        if (centroid.every((n) => Number.isFinite(n))) {
          g.append("text")
            .attr("x", centroid[0])
            .attr("y", centroid[1])
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", 16)
            .attr("font-weight", 800)
            .attr("fill", "#1a1a1a")
            .style("pointer-events", "none")
            .style("user-select", "none")
            .text(layer.name);
        }
      });

      guGroups.on("click", (_e, layer) => {
        // 페이드 줌인
        root
          .transition()
          .duration(400)
          .style("opacity", 0)
          .on("end", () => {
            setSelectedGu(layer.code);
            setMode("dong");
          });
      });
    } else if (mode === "dong" && selectedGu && selectedFc) {
      projection.fitSize([VIEW_SIZE, VIEW_SIZE - 40], selectedFc);

      const dongList = regions.filter((r) => r.gu_code === selectedGu);

      const dongGroups = root
        .selectAll<SVGGElement, SuwonRegion>("g.dong")
        .data(dongList, (d) => d.adm_cd2)
        .enter()
        .append("g")
        .attr("class", "dong")
        .style("cursor", "pointer");

      dongGroups.each(function (r) {
        const feature = {
          type: "Feature" as const,
          properties: { adm_cd2: r.adm_cd2 },
          geometry: r.geojson,
        };
        const g = d3.select(this);
        const baseFill = r.has_pledge ? "#FF6B00" : "#FFE0C0";
        g.append("path")
          .attr("d", path(feature) ?? "")
          .attr("fill", baseFill)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1)
          .style("transition", "fill 150ms ease")
          .on("mouseenter", function (event) {
            d3.select(this).attr("fill", darken(baseFill, 0.1));
            showTooltip(event, r);
          })
          .on("mousemove", (event) => moveTooltip(event))
          .on("mouseleave", function () {
            d3.select(this).attr("fill", baseFill);
            setTooltip(null);
          })
          .on("click", () => onDongClick(r.adm_cd2, r.dong_name, r.gu_name));

        // 동 라벨 (중심이 path 내부일 때만, 면적이 너무 작으면 숨김)
        const [cx, cy] = path.centroid(feature);
        const area = path.area(feature);
        if (Number.isFinite(cx) && Number.isFinite(cy) && area > 400) {
          g.append("text")
            .attr("x", cx)
            .attr("y", cy)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", 10)
            .attr("font-weight", 700)
            .attr("fill", "#1a1a1a")
            .style("pointer-events", "none")
            .style("user-select", "none")
            .text(r.dong_name);
        }
      });

      // 페이드 인
      root.style("opacity", 0).transition().duration(400).style("opacity", 1);
    }

    function showTooltip(event: MouseEvent, r: SuwonRegion) {
      const rect = svgEl!.getBoundingClientRect();
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        text: `${r.dong_name} · ${r.has_pledge ? "공약 있음" : "준비중"}`,
      });
    }
    function moveTooltip(event: MouseEvent) {
      const rect = svgEl!.getBoundingClientRect();
      setTooltip((t) =>
        t
          ? {
              ...t,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            }
          : t
      );
    }
  }, [mode, selectedGu, regions, allFc, selectedFc, guLayers, onDongClick]);

  // ───── 렌더 ─────

  const currentGuName =
    mode === "dong" && selectedGu
      ? GU_LIST.find((g) => g.code === selectedGu)?.name ?? ""
      : "";

  return (
    <div className="relative w-full">
      {/* 상단 오버레이 */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        {mode === "gu" ? (
          <span className="rounded-md bg-white/90 px-3 py-1 text-sm font-bold text-[#FF6B00] shadow">
            수원특례시
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                const svg = svgRef.current;
                if (!svg) return;
                const root = d3.select(svg).select("g.root");
                root
                  .transition()
                  .duration(400)
                  .style("opacity", 0)
                  .on("end", () => {
                    setSelectedGu(null);
                    setMode("gu");
                  });
              }}
              className="inline-flex items-center gap-1 rounded-md bg-white/90 px-3 py-1 text-xs font-bold text-gray-800 shadow hover:bg-white"
            >
              ← 구 전체 보기
            </button>
            <span className="rounded-md bg-[#FF6B00] px-3 py-1 text-xs font-bold text-white shadow">
              {currentGuName}
            </span>
          </>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        role="img"
        aria-label={
          mode === "gu"
            ? "수원특례시 4개 구 지도"
            : `${currentGuName} 행정동 지도`
        }
        className="h-auto w-full max-w-3xl"
        style={{ background: "rgba(255,107,0,0.04)", borderRadius: 12 }}
      />

      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white shadow"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y + 12,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

// ───── 색상 유틸 ─────

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const v = parseInt(
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m,
    16
  );
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}
function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}
function brighten(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount
  );
}
function darken(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

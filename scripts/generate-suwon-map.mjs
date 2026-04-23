#!/usr/bin/env node
/**
 * 수원시 44개 행정동 GeoJSON → 사전 투영된 SVG path 문자열로 변환.
 *
 * 입력 : C:/Users/User/HangJeongDong_ver202506.json (vuski/admdongkor 계열)
 * 출력 : data/suwon-map-data.ts
 *
 * 런타임 d3 의존 제거가 목적. 이 스크립트는 빌드 밖에서 한 번만 실행하면 되며,
 * 실행 후에는 d3 패키지를 제거해도 앱은 정상 동작.
 *
 * 실행:
 *   node scripts/generate-suwon-map.mjs
 */

import fs from "node:fs";
import path from "node:path";

const SRC = "C:/Users/User/HangJeongDong_ver202506.json";
const OUT = path.resolve(process.cwd(), "data/suwon-map-data.ts");

const VIEW_W = 600;
const VIEW_H = 560;
const PADDING = 20;

const GU_META = {
  "41111": { code: "jangan", name: "장안구", color: "#FF6B00" },
  "41113": { code: "gwonseon", name: "권선구", color: "#FF8C42" },
  "41115": { code: "paldal", name: "팔달구", color: "#FFB347" },
  "41117": { code: "yeongtong", name: "영통구", color: "#FFC680" },
};

const raw = JSON.parse(fs.readFileSync(SRC, "utf8"));
const suwon = raw.features.filter((f) =>
  (f.properties?.sggnm || "").startsWith("수원시")
);
if (suwon.length !== 44) {
  console.warn(`경고: 수원 features 수가 예상(44)과 다름 — ${suwon.length}`);
}

function round(n, d = 1) {
  return Math.round(n * 10 ** d) / 10 ** d;
}

/**
 * 수원시 전체 좌표에서 lng/lat bbox를 구하고,
 * 위도 중심 기준 cos(lat) 보정을 적용한 equirectangular 투영을
 * 직접 구현해 [PADDING, VIEW_W-PADDING] × [PADDING, VIEW_H-PADDING] 영역에 피팅한다.
 *
 * (수원처럼 작은 지역은 정확한 Mercator와 시각적으로 구분되지 않음.
 * d3.geoMercator().fitSize()는 전역 구면 투영 특성 때문에 이 스케일에서 fitSize가
 * 의도대로 동작하지 않는 이슈가 있어 직접 구현)
 */
function buildProjection(features) {
  let lngMin = Infinity, lngMax = -Infinity, latMin = Infinity, latMax = -Infinity;
  for (const f of features) {
    const polys =
      f.geometry.type === "Polygon"
        ? [f.geometry.coordinates]
        : f.geometry.coordinates;
    for (const poly of polys) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          if (lng < lngMin) lngMin = lng;
          if (lng > lngMax) lngMax = lng;
          if (lat < latMin) latMin = lat;
          if (lat > latMax) latMax = lat;
        }
      }
    }
  }
  const latMid = (latMin + latMax) / 2;
  const aspect = Math.cos((latMid * Math.PI) / 180); // 위도 보정

  const dataW = (lngMax - lngMin) * aspect;
  const dataH = latMax - latMin;

  const availW = VIEW_W - PADDING * 2;
  const availH = VIEW_H - PADDING * 2;
  const scale = Math.min(availW / dataW, availH / dataH);

  // 중앙 정렬용 offset
  const offX = (availW - dataW * scale) / 2;
  const offY = (availH - dataH * scale) / 2;

  return function project([lng, lat]) {
    const x = PADDING + offX + (lng - lngMin) * aspect * scale;
    // 위도는 위가 크므로 Y축 뒤집기
    const y = PADDING + offY + (latMax - lat) * scale;
    return [x, y];
  };
}

const projection = buildProjection(suwon);

function buildPathD(geometry) {
  const rings =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : [];
  const parts = [];
  for (const poly of rings) {
    for (const ring of poly) {
      const pts = ring.map((c) => projection(c));
      if (pts.length === 0) continue;
      const segs = pts.map(([x, y]) => `${round(x, 1)},${round(y, 1)}`);
      parts.push("M" + segs.join("L") + "Z");
    }
  }
  return parts.join("");
}

function computeBBoxFromD(dStr) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const re = /(-?\d+\.?\d*),(-?\d+\.?\d*)/g;
  let m;
  while ((m = re.exec(dStr)) !== null) {
    const x = +m[1];
    const y = +m[2];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

const dongs = suwon.map((f) => {
  const p = f.properties;
  const gu = GU_META[p.sgg];
  if (!gu) throw new Error(`알 수 없는 sgg: ${p.sgg}`);
  const dong_name = p.adm_nm.split(" ").pop();
  const d = buildPathD(f.geometry);
  const bb = computeBBoxFromD(d);
  return {
    adm_cd2: p.adm_cd2,
    gu_code: gu.code,
    dong_name,
    d,
    cx: round((bb.minX + bb.maxX) / 2, 1),
    cy: round((bb.minY + bb.maxY) / 2, 1),
    minX: round(bb.minX, 1),
    minY: round(bb.minY, 1),
    maxX: round(bb.maxX, 1),
    maxY: round(bb.maxY, 1),
  };
});

// 구별 라벨 위치: 해당 구 동들의 centroid 평균
const guLabels = Object.values(GU_META).map((gu) => {
  const list = dongs.filter((d) => d.gu_code === gu.code);
  const lx = list.reduce((s, d) => s + d.cx, 0) / list.length;
  const ly = list.reduce((s, d) => s + d.cy, 0) / list.length;
  return {
    gu_code: gu.code,
    gu_name: gu.name,
    color: gu.color,
    label_x: round(lx, 1),
    label_y: round(ly, 1),
  };
});

// 정렬: 구(장안→권선→팔달→영통) → 동명 가나다
const guOrder = ["jangan", "gwonseon", "paldal", "yeongtong"];
dongs.sort((a, b) => {
  const ga = guOrder.indexOf(a.gu_code);
  const gb = guOrder.indexOf(b.gu_code);
  if (ga !== gb) return ga - gb;
  return a.dong_name.localeCompare(b.dong_name, "ko");
});

const out = `// ⚠️ AUTO-GENERATED — do not edit by hand.
// 생성: scripts/generate-suwon-map.mjs (소스: HangJeongDong_ver202506.json)
// 수원시 44개 행정동을 위도중심 cos 보정 equirectangular로 ${VIEW_W}×${VIEW_H} viewBox에 피팅한 결과.

export const SUWON_VIEWBOX = "0 0 ${VIEW_W} ${VIEW_H}";
export const SUWON_VIEW_WIDTH = ${VIEW_W};
export const SUWON_VIEW_HEIGHT = ${VIEW_H};

export type SuwonGuCode = "jangan" | "gwonseon" | "paldal" | "yeongtong";

export type GuMeta = {
  gu_code: SuwonGuCode;
  gu_name: string;
  color: string;
  label_x: number;
  label_y: number;
};

export type DongMeta = {
  adm_cd2: string;
  gu_code: SuwonGuCode;
  dong_name: string;
  d: string;
  cx: number;
  cy: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export const GU_LIST: GuMeta[] = ${JSON.stringify(guLabels, null, 2)};

export const DONG_LIST: DongMeta[] = [
${dongs.map((d) => "  " + JSON.stringify(d)).join(",\n")}
];
`;

fs.writeFileSync(OUT, out, "utf8");
const size = fs.statSync(OUT).size;
console.log(
  `✓ wrote ${OUT} — ${dongs.length} 동, ${guLabels.length} 구, ${Math.round(
    size / 1024
  )} KB`
);

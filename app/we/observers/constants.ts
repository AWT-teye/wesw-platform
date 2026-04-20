export const RESIDENCE_OPTIONS = [
  "수원시권선구",
  "수원시영통구",
  "수원시장안구",
  "수원시팔달구",
  "수원외",
] as const;

export type Residence = (typeof RESIDENCE_OPTIONS)[number];

export function formatResidenceLabel(r: Residence): string {
  switch (r) {
    case "수원시권선구":
      return "수원시 권선구";
    case "수원시영통구":
      return "수원시 영통구";
    case "수원시장안구":
      return "수원시 장안구";
    case "수원시팔달구":
      return "수원시 팔달구";
    case "수원외":
      return "수원 외";
  }
}

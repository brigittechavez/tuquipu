import type { CSSProperties, ReactNode } from "react";

/**
 * Tiny isometric (2.5D) toolkit shared by the plant scenes. World axes: x runs to
 * the lower right, y to the lower left, z up. Drawn in the approved language:
 * carbon outlines, lavender faces, violet/mint accents.
 */

export type Iso = { ox: number; oy: number };
export type Pt = [number, number];

export const ISO_C = 0.866;
export const ISO_S = 0.5;

export const ISO_FILL = {
  white: "#FFFFFF",
  soft: "#F4F2FF",
  lav: "#EBE7FF",
  lav2: "#D9D2FF",
  violet: "#6045F4",
  action: "#7700E6",
  mint: "#21C7B7",
  carbon: "#12131A",
  surface: "#F9FAFB",
} as const;

export const ISO_STROKE = { stroke: "#12131A", strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" } as const;

export const isoPoint = (iso: Iso, x: number, y: number, z = 0): Pt => [iso.ox + (x - y) * ISO_C, iso.oy + (x + y) * ISO_S - z];
export const isoPts = (...p: Pt[]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

export function cssVars(v: Record<string, number | string>): CSSProperties {
  return Object.fromEntries(Object.entries(v).map(([k, n]) => [`--${k}`, n])) as CSSProperties;
}

type BoxProps = { iso: Iso; x: number; y: number; z?: number; w: number; d: number; h: number; top?: string; left?: string; right?: string; className?: string };

/** Axis-aligned box: top + the two faces that look at the viewer. */
export function IsoBox({ iso, x, y, z = 0, w, d, h, top = ISO_FILL.white, left = ISO_FILL.lav, right = ISO_FILL.lav2, className }: BoxProps) {
  const P = (a: number, b: number, c: number) => isoPoint(iso, a, b, c);
  return (
    <g {...ISO_STROKE} className={className}>
      <polygon points={isoPts(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h))} fill={left} />
      <polygon points={isoPts(P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h))} fill={right} />
      <polygon points={isoPts(P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h))} fill={top} />
    </g>
  );
}

/** Vertical cylinder (tanks, jars, bottles). */
export function IsoCylinder({ iso, x, y, z = 0, r, h, body = ISO_FILL.white, top = ISO_FILL.lav, className }: { iso: Iso; x: number; y: number; z?: number; r: number; h: number; body?: string; top?: string; className?: string }) {
  const [sx, sy] = isoPoint(iso, x, y, z);
  const rx = r * 1.2247;
  const ry = r * 0.7071;
  return (
    <g {...ISO_STROKE} className={className}>
      <path d={`M${sx - rx} ${sy}V${sy - h}A${rx} ${ry} 0 0 0 ${sx + rx} ${sy - h}V${sy}A${rx} ${ry} 0 0 1 ${sx - rx} ${sy}Z`} fill={body} />
      <ellipse cx={sx} cy={sy - h} rx={rx} ry={ry} fill={top} />
    </g>
  );
}

/** Flat rectangle standing on a front-left plane (y = const): screens, receipts, signs. */
export function IsoPanel({ iso, x, y, z, w, h, fill = ISO_FILL.white, className, children }: { iso: Iso; x: number; y: number; z: number; w: number; h: number; fill?: string; className?: string; children?: ReactNode }) {
  const P = (a: number, c: number) => isoPoint(iso, a, y, c);
  const [sx, sy] = P(x, z + h);
  return (
    <g className={className}>
      <polygon points={isoPts(P(x, z), P(x + w, z), P(x + w, z + h), P(x, z + h))} fill={fill} {...ISO_STROKE} />
      {children ? <g transform={`matrix(${ISO_C} ${ISO_S} 0 1 ${sx} ${sy})`}>{children}</g> : null}
    </g>
  );
}

/** Text painted on a front-left face (plane y = const). */
export function IsoFaceLabel({ iso, x, y, z, className, children }: { iso: Iso; x: number; y: number; z: number; className?: string; children: ReactNode }) {
  const [sx, sy] = isoPoint(iso, x, y, z);
  return (
    <text transform={`matrix(${ISO_C} ${ISO_S} 0 1 ${sx} ${sy})`} className={className}>
      {children}
    </text>
  );
}

import type { CSSProperties, ReactNode } from "react";
import styles from "./IsoPlant.module.css";

/**
 * 2.5D (isometric) version of the plant for "Lo que suele pasar": four areas —
 * Compras, Stock, Producción, Ventas — drawn in the approved language (carbon
 * outlines, lavender faces, violet/mint accents).
 *
 * Scroll-scrubbed by `--p` (from <ScrollProgress>): first the islands drift apart,
 * each buried in its own loose records; then they dock onto one base, the records
 * fly into a single Tu Quipu panel and a batch starts hopping from area to area.
 * `--p` defaults to 1 (no JS / reduced motion): the docked, readable state.
 */

const OX = 420;
const OY = 300;
const CX = 0.866;
const SY = 0.5;
const STROKE = { stroke: "#12131A", strokeWidth: 2.5, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const F = {
  white: "#FFFFFF",
  soft: "#F4F2FF",
  lav: "#EBE7FF",
  lav2: "#D9D2FF",
  violet: "#6045F4",
  action: "#7700E6",
  mint: "#21C7B7",
  carbon: "#12131A",
  surface: "#F9FAFB",
};

type Pt = [number, number];
const P = (x: number, y: number, z = 0): Pt => [OX + (x - y) * CX, OY + (x + y) * SY - z];
const pts = (...p: Pt[]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

function vars(v: Record<string, number>): CSSProperties {
  return Object.fromEntries(Object.entries(v).map(([k, n]) => [`--${k}`, n])) as CSSProperties;
}

/** Axis-aligned box: top + the two faces that look at the viewer. */
function Box({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  top = F.white,
  left = F.lav,
  right = F.lav2,
}: {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  top?: string;
  left?: string;
  right?: string;
}) {
  return (
    <g {...STROKE}>
      <polygon points={pts(P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h))} fill={left} />
      <polygon points={pts(P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h))} fill={right} />
      <polygon points={pts(P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h))} fill={top} />
    </g>
  );
}

/** Vertical cylinder (tanks, jars). */
function Cylinder({
  x,
  y,
  z = 0,
  r,
  h,
  body = F.white,
  top = F.lav,
}: {
  x: number;
  y: number;
  z?: number;
  r: number;
  h: number;
  body?: string;
  top?: string;
}) {
  const [sx, sy] = P(x, y, z);
  const rx = r * 1.2247;
  const ry = r * 0.7071;
  return (
    <g {...STROKE}>
      <path
        d={`M${sx - rx} ${sy}V${sy - h}A${rx} ${ry} 0 0 0 ${sx + rx} ${sy - h}V${sy}A${rx} ${ry} 0 0 1 ${sx - rx} ${sy}Z`}
        fill={body}
      />
      <ellipse cx={sx} cy={sy - h} rx={rx} ry={ry} fill={top} />
    </g>
  );
}

/** Text lying on a front-left face (plane y = const), like a painted label. */
function FaceLabel({ x, y, z, children }: { x: number; y: number; z: number; children: ReactNode }) {
  const [sx, sy] = P(x, y, z);
  return (
    <text transform={`matrix(${CX} ${SY} 0 1 ${sx} ${sy})`} className={styles.faceLabel}>
      {children}
    </text>
  );
}

/* ─── The four areas, each on its own island (local coords from the island origin) ─── */
const T = 180; // island size
const TH = 22; // island thickness

function Island({
  gx,
  gy,
  label,
  ox,
  oy,
  children,
}: {
  gx: number;
  gy: number;
  label: string;
  ox: number;
  oy: number;
  children: ReactNode;
}) {
  return (
    <g className={styles.island} style={vars({ ox, oy })}>
      <g className={styles.bob}>
        <Box x={gx} y={gy} z={-TH} w={T} d={T} h={TH} top={F.soft} left={F.lav} right={F.lav2} />
        <FaceLabel x={gx + 16} y={gy + T} z={-TH + 7}>
          {label}
        </FaceLabel>
        {children}
      </g>
    </g>
  );
}

function Compras({ gx, gy }: { gx: number; gy: number }) {
  return (
    <>
      <Box x={gx + 24} y={gy + 22} w={34} d={34} h={30} top={F.surface} />
      <Box x={gx + 28} y={gy + 26} z={30} w={26} d={26} h={24} top={F.lav} left={F.lav2} right={F.violet} />
      <Box x={gx + 30} y={gy + 78} w={96} d={62} h={70} top={F.white} left={F.white} right={F.lav} />
      <Box x={gx + 126} y={gy + 84} w={34} d={52} h={48} top={F.lav} left={F.lav2} right={F.violet} />
      <polygon
        points={pts(P(gx + 46, gy + 140, 52), P(gx + 96, gy + 140, 52), P(gx + 96, gy + 140, 60), P(gx + 46, gy + 140, 60))}
        fill={F.action}
      />
      {[gx + 52, gx + 140].map((x) => {
        const [sx, sy] = P(x, gy + 142, 4);
        return <ellipse key={x} cx={sx} cy={sy} rx={11} ry={13} fill={F.carbon} />;
      })}
    </>
  );
}

function Stock({ gx, gy }: { gx: number; gy: number }) {
  const x0 = gx + 34;
  const y0 = gy + 50;
  return (
    <>
      {/* Four thin posts: the shelf reads light, not as two black walls. */}
      <Box x={x0} y={y0} w={6} d={6} h={118} top={F.carbon} left={F.carbon} right={F.carbon} />
      <Box x={x0 + 118} y={y0} w={6} d={6} h={118} top={F.carbon} left={F.carbon} right={F.carbon} />
      <Box x={x0} y={y0 + 64} w={6} d={6} h={118} top={F.carbon} left={F.carbon} right={F.carbon} />
      {[0, 40, 80].map((z, k) => (
        <g key={z}>
          <Box x={x0} y={y0} z={z} w={124} d={70} h={6} top={F.white} left={F.lav2} right={F.lav2} />
          <Box x={x0 + 14} y={y0 + 20} z={z + 6} w={26} d={30} h={k === 2 ? 22 : 26} top={F.surface} />
          <Box x={x0 + 52} y={y0 + 20} z={z + 6} w={26} d={30} h={22} top={F.lav} left={F.lav2} right={F.violet} />
          {k < 2 ? <Box x={x0 + 88} y={y0 + 22} z={z + 6} w={24} d={26} h={24} top={F.surface} /> : null}
        </g>
      ))}
      <Box x={x0 + 118} y={y0 + 64} w={6} d={6} h={118} top={F.carbon} left={F.carbon} right={F.carbon} />
    </>
  );
}

function Produccion({ gx, gy }: { gx: number; gy: number }) {
  return (
    <>
      <Box x={gx + 118} y={gy + 26} w={42} d={130} h={16} top={F.carbon} left={F.carbon} right={F.carbon} />
      {[46, 82, 118].map((y, i) => (
        <Cylinder key={y} x={gx + 139} y={gy + y} z={16} r={9} h={18} body={F.white} top={i === 1 ? F.mint : F.action} />
      ))}
      <Cylinder x={gx + 62} y={gy + 92} r={44} h={92} body={F.white} top={F.lav} />
      <Box x={gx + 52} y={gy + 82} z={92} w={22} d={22} h={20} top={F.violet} left={F.action} right={F.violet} />
    </>
  );
}

function Ventas({ gx, gy }: { gx: number; gy: number }) {
  return (
    <>
      <Box x={gx + 36} y={gy + 70} w={118} d={62} h={52} top={F.lav} left={F.white} right={F.lav} />
      <polygon
        points={pts(P(gx + 50, gy + 132, 18), P(gx + 100, gy + 132, 18), P(gx + 100, gy + 132, 26), P(gx + 50, gy + 132, 26))}
        fill={F.action}
      />
      <Box x={gx + 112} y={gy + 82} z={52} w={30} d={30} h={26} top={F.carbon} left={F.carbon} right={F.carbon} />
      <Cylinder x={gx + 66} y={gy + 96} z={52} r={9} h={20} body={F.white} top={F.action} />
      <g className={styles.receipt}>
        <polygon
          points={pts(P(gx + 118, gy + 96, 78), P(gx + 136, gy + 96, 78), P(gx + 136, gy + 96, 122), P(gx + 118, gy + 96, 122))}
          fill={F.white}
          {...STROKE}
        />
      </g>
    </>
  );
}

/* ─── Loose records (chaos) ─── */
function Mess({ t, tx, ty, children }: { t: number; tx: number; ty: number; children: ReactNode }) {
  return (
    <g className={styles.mess} style={vars({ t, tx, ty })}>
      <g className={styles.flutter}>{children}</g>
    </g>
  );
}

function Paper({ x, y, mark, r = 0 }: { x: number; y: number; mark?: string; r?: number }) {
  return (
    <g transform={`rotate(${r} ${x + 28} ${y + 34})`}>
      <rect x={x} y={y} width={56} height={68} rx={8} fill={F.white} {...STROKE} />
      <path
        d={`M${x + 11} ${y + 18}H${x + 44}M${x + 11} ${y + 32}H${x + 38}M${x + 11} ${y + 46}H${x + 32}`}
        stroke={F.lav}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {mark ? (
        <text x={x + 46} y={y + 62} textAnchor="end" className={styles.mark}>
          {mark}
        </text>
      ) : null}
    </g>
  );
}

function Note({ x, y, w, text, r = 0, tail }: { x: number; y: number; w: number; text: string; r?: number; tail?: boolean }) {
  return (
    <g transform={`rotate(${r} ${x + w / 2} ${y + 20})`}>
      <rect x={x} y={y} width={w} height={40} rx={tail ? 14 : 8} fill={F.white} {...STROKE} />
      {tail ? <path d={`M${x + 24} ${y + 40}l-6 12 14-12`} fill={F.white} {...STROKE} /> : null}
      <text x={x + w / 2} y={y + 26} textAnchor="middle" className={styles.noteText}>
        {text}
      </text>
    </g>
  );
}

function Question({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={17} fill={F.carbon} />
      <text x={cx} y={cy + 7} textAnchor="middle" className={styles.question}>
        ?
      </text>
    </g>
  );
}

/* Island grid: Compras (back) → Stock (right) → Producción (front) → Ventas (left). */
const G = 220;
const PANEL = { x: OX - 130, y: OY - 250, w: 260, h: 150 };

export function IsoPlant({ items, className }: { items: readonly string[]; className?: string }) {
  const [c1, c2, c3, c4] = [P(90, 90, 60), P(G + 90, 90, 60), P(G + 90, G + 90, 60), P(90, G + 90, 60)];
  const hop = (a: Pt, b: Pt) => `Q${(a[0] + b[0]) / 2} ${Math.min(a[1], b[1]) - 70} ${b[0]} ${b[1]}`;
  const loop = `M${c1[0]} ${c1[1]}${hop(c1, c2)}${hop(c2, c3)}${hop(c3, c4)}${hop(c4, c1)}`;
  return (
    <svg data-iso-svg viewBox="0 0 840 780" className={[styles.scene, className].filter(Boolean).join(" ")} aria-hidden focusable="false">
      <defs>
        <radialGradient id="iso-glow" cx="50%" cy="55%" r="50%">
          <stop offset="0" className={styles.glowTop} />
          <stop offset="1" className={styles.glowEnd} />
        </radialGradient>
      </defs>
      <ellipse cx={OX} cy={OY + 230} rx={420} ry={250} fill="url(#iso-glow)" />

      {/* The shared base rises as the areas dock (one system underneath everything). */}
      <g className={styles.base}>
        <Box x={-24} y={-24} z={-TH - 22} w={2 * G - 40 + 48 + 0} d={2 * G - 40 + 48} h={22} top={F.white} left={F.lav} right={F.lav2} />
      </g>

      <Island gx={0} gy={0} label={items[0]} ox={0} oy={-70}>
        <Compras gx={0} gy={0} />
      </Island>
      <Island gx={G} gy={0} label={items[1]} ox={96} oy={-6}>
        <Stock gx={G} gy={0} />
      </Island>
      <Island gx={0} gy={G} label={items[3]} ox={-96} oy={-6}>
        <Ventas gx={0} gy={G} />
      </Island>
      <Island gx={G} gy={G} label={items[2]} ox={0} oy={56}>
        <Produccion gx={G} gy={G} />
      </Island>

      {/* A batch hops Compras → Stock → Producción → Ventas once everything is connected. */}
      <g className={styles.batch}>
        <g>
          <rect x={-10} y={-10} width={20} height={20} rx={5} fill={F.mint} {...STROKE} />
          <animateMotion dur="6s" repeatCount="indefinite" path={loop} />
        </g>
      </g>

      {/* Loose records around each area. */}
      <g className={styles.messLayer}>
        <Mess t={0.02} tx={OX - 300} ty={PANEL.y + 40 - (OY - 150)}>
          <Paper x={260} y={OY - 170} mark="?" r={-8} />
        </Mess>
        <Mess t={0.16} tx={OX - 380} ty={PANEL.y + 40 - (OY - 120)}>
          <Paper x={330} y={OY - 138} r={6} />
        </Mess>
        <Mess t={0.24} tx={-210} ty={-150}>
          <Note x={560} y={OY - 40} w={140} text="Stock: 120" r={-4} />
        </Mess>
        <Mess t={0.32} tx={-230} ty={-90}>
          <Note x={612} y={OY + 26} w={64} text="98" r={5} />
        </Mess>
        <Mess t={0.42} tx={60} ty={-300}>
          <Note x={250} y={OY + 120} w={172} text="¿Hay stock?" r={-3} tail />
        </Mess>
        <Mess t={0.5} tx={-20} ty={-390}>
          <Note x={420} y={OY + 250} w={214} text="¿Cuánto se produjo?" r={3} tail />
        </Mess>
        <Mess t={0.28} tx={140} ty={-150}>
          <Question cx={250} cy={OY - 30} />
        </Mess>
        <Mess t={0.46} tx={-150} ty={-260}>
          <Question cx={600} cy={OY + 150} />
        </Mess>
        <Mess t={0.56} tx={170} ty={-330}>
          <Question cx={230} cy={OY + 250} />
        </Mess>
      </g>

      {/* One system: the records end up as rows of the same panel. */}
      <g className={styles.panel}>
        <ellipse cx={OX} cy={PANEL.y + PANEL.h + 46} rx={90} ry={14} fill={F.carbon} opacity="0.08" />
        <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={20} fill={F.white} {...STROKE} />
        <rect x={PANEL.x + 20} y={PANEL.y + 18} width={74} height={11} rx={5.5} fill={F.action} />
        {items.map((label, i) => (
          <g key={label} className={styles.row} style={vars({ i })}>
            <circle cx={PANEL.x + 32} cy={PANEL.y + 50 + i * 26} r={9} fill={F.mint} stroke={F.white} strokeWidth={2} />
            <path d={`M${PANEL.x + 28} ${PANEL.y + 50 + i * 26}l3 3 6-6`} fill="none" {...STROKE} strokeWidth={2} />
            <text x={PANEL.x + 50} y={PANEL.y + 56 + i * 26} className={styles.rowText}>
              {label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

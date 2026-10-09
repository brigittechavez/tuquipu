import { ISO_FILL as F, ISO_STROKE, IsoBox, IsoCylinder, IsoFaceLabel, IsoPanel, cssVars, isoPoint, type Iso } from "./iso";
import styles from "./IsoJourney.module.css";

/**
 * "Cómo funciona" as a 2.5D production route: five islands joined by conveyors —
 * Compra (truck at the dock) → Stock (shelves) → Produce (mixing vessel + filling)
 * → Vende (counter, receipt, SUNAT) → Controla (wall panel). Each station carries
 * `data-station` (a controller sets pending/active/done; absent = finished, so the
 * scene reads complete without JS). A batch token rides the route and changes shape.
 * Camera keyframes and token anchors are exposed as data attributes for the controller.
 */

const ISO: Iso = { ox: 210, oy: 150 };
const STEP = 300;
const T = 200;
const TH = 24;
export const JOURNEY_STATIONS = ["compra", "stock", "produce", "vende", "controla"] as const;

const P = (x: number, y: number, z = 0) => isoPoint(ISO, x, y, z);
const center = (i: number) => P(i * STEP + T / 2, T / 2, 40);

/* Camera: one framing per station, then the whole route for "Controla". */
const ALL = (() => {
  const a = P(-T, 0);
  const b = P(4 * STEP + T, T);
  return { cx: (a[0] + b[0]) / 2 + 40, cy: (P(0, 0, 200)[1] + b[1]) / 2 + 20, w: b[0] - a[0] + 60 };
})();
/* w: phones, wDesk: desktop (wider framing), minH: height the framing must fit. */
const CAMERA = [0, 1, 2, 3].map((i) => {
  const [cx, cy] = center(i);
  return { cx, cy: cy - 30, w: 780, wDesk: 1180, shift: 0.12, minH: 0 };
});
CAMERA.push({ ...ALL, wDesk: ALL.w, shift: 0.08, minH: 1020 });

function Island({ i, label, children }: { i: number; label: string; children: React.ReactNode }) {
  const gx = i * STEP;
  return (
    <g className={styles.station} data-station={JOURNEY_STATIONS[i]}>
      <ellipse cx={center(i)[0]} cy={P(gx + T / 2, T / 2, -TH)[1] + 30} rx={190} ry={60} className={styles.glow} />
      <IsoBox iso={ISO} x={gx} y={0} z={-TH} w={T} d={T} h={TH} top={F.soft} left={F.lav} right={F.lav2} />
      <IsoFaceLabel iso={ISO} x={gx + 18} y={T} z={-TH + 8} className={styles.faceLabel}>
        {label}
      </IsoFaceLabel>
      {children}
    </g>
  );
}

function Conveyor({ i }: { i: number }) {
  const x = i * STEP + T;
  return (
    <g>
      <IsoBox iso={ISO} x={x} y={T / 2 - 22} z={-12} w={STEP - T} d={44} h={12} top={F.carbon} left={F.carbon} right={F.carbon} />
      {[18, 50, 82].map((dx) => {
        const [a, b] = [P(x + dx, T / 2 - 22, 0), P(x + dx, T / 2 + 22, 0)];
        return <line key={dx} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={F.lav2} strokeWidth={2} />;
      })}
    </g>
  );
}

function Compra() {
  const gx = 0;
  const [dx, dy] = P(gx + 70, 92, 168);
  return (
    <>
      <g className={styles.truck}>
        <IsoBox iso={ISO} x={gx + 20} y={58} w={100} d={66} h={72} top={F.white} left={F.white} right={F.lav} />
        <IsoBox iso={ISO} x={gx + 120} y={64} w={38} d={54} h={50} top={F.lav} left={F.lav2} right={F.violet} />
        <IsoPanel iso={ISO} x={gx + 34} y={124} z={46} w={52} h={8} fill={F.action} />
        {[gx + 44, gx + 138].map((x) => {
          const [sx, sy] = P(x, 126, 4);
          return <ellipse key={x} cx={sx} cy={sy} rx={11} ry={13} fill={F.carbon} />;
        })}
      </g>
      <g className={styles.unload}>
        <IsoBox iso={ISO} x={gx + 128} y={140} w={34} d={34} h={30} top={F.surface} />
        <IsoBox iso={ISO} x={gx + 132} y={144} z={30} w={26} d={26} h={24} top={F.lav} left={F.lav2} right={F.violet} />
      </g>
      <g className={styles.pop}>
        <rect x={dx - 46} y={dy - 30} width={92} height={70} rx={10} fill={F.white} {...ISO_STROKE} />
        <rect x={dx - 32} y={dy - 18} width={40} height={9} rx={4.5} fill={F.violet} />
        <path d={`M${dx - 32} ${dy + 4}H${dx + 30}M${dx - 32} ${dy + 18}H${dx + 16}`} stroke={F.lav} strokeWidth={6} strokeLinecap="round" />
        <circle cx={dx + 44} cy={dy - 30} r={13} fill={F.mint} stroke={F.white} strokeWidth={3} />
        <path d={`M${dx + 38} ${dy - 30}l4 4 8-8`} fill="none" {...ISO_STROKE} strokeWidth={3} />
      </g>
    </>
  );
}

function Stock() {
  const x0 = STEP + 38;
  const y0 = 54;
  const post = (x: number, y: number) => <IsoBox iso={ISO} x={x} y={y} w={6} d={6} h={124} top={F.carbon} left={F.carbon} right={F.carbon} />;
  return (
    <>
      {post(x0, y0)}
      {[0, 44, 88].map((z, k) => (
        <g key={z}>
          <IsoBox iso={ISO} x={x0} y={y0} z={z} w={126} d={72} h={6} top={F.white} left={F.lav2} right={F.lav2} />
          <g className={styles.arrive} style={cssVars({ k })}>
            <IsoBox iso={ISO} x={x0 + 14} y={y0 + 22} z={z + 6} w={28} d={30} h={k === 2 ? 22 : 28} top={F.surface} />
            <IsoBox iso={ISO} x={x0 + 54} y={y0 + 22} z={z + 6} w={28} d={30} h={24} top={F.lav} left={F.lav2} right={F.violet} />
            {k < 2 ? <IsoBox iso={ISO} x={x0 + 92} y={y0 + 24} z={z + 6} w={24} d={26} h={26} top={F.surface} /> : null}
          </g>
        </g>
      ))}
      {post(x0 + 120, y0)}
      {post(x0, y0 + 66)}
      {post(x0 + 120, y0 + 66)}
    </>
  );
}

function Produce() {
  const gx = 2 * STEP;
  return (
    <>
      <IsoBox iso={ISO} x={gx + 128} y={28} w={40} d={150} h={14} top={F.carbon} left={F.carbon} right={F.carbon} />
      {[48, 86, 124, 160].map((y, k) => (
        <g key={y} className={styles.jar} style={cssVars({ k })}>
          <IsoCylinder iso={ISO} x={gx + 148} y={y} z={14} r={9} h={20} body={F.white} top={k % 2 ? F.mint : F.action} />
        </g>
      ))}
      {/* Liquid inside, seen through the glass body; the closed lid stays in front. */}
      <g className={styles.liquid}>
        <IsoCylinder iso={ISO} x={gx + 66} y={100} z={8} r={40} h={48} body={F.lav2} top={F.lav} />
      </g>
      <IsoCylinder iso={ISO} x={gx + 66} y={100} r={46} h={100} body="rgba(255, 255, 255, 0.55)" top={F.lav} />
      <IsoBox iso={ISO} x={gx + 55} y={89} z={100} w={22} d={22} h={20} top={F.violet} left={F.action} right={F.violet} />
      <g className={styles.paddle}>
        <IsoBox iso={ISO} x={gx + 64} y={98} z={120} w={4} d={4} h={26} top={F.carbon} left={F.carbon} right={F.carbon} />
      </g>
    </>
  );
}

function Vende() {
  const gx = 3 * STEP;
  const [bx, by] = P(gx + 70, 100, 150);
  return (
    <>
      <IsoBox iso={ISO} x={gx + 36} y={72} w={124} d={62} h={54} top={F.lav} left={F.white} right={F.lav} />
      <IsoPanel iso={ISO} x={gx + 52} y={134} z={18} w={52} h={8} fill={F.action} />
      <g className={styles.sold}>
        <IsoCylinder iso={ISO} x={gx + 66} y={98} z={54} r={9} h={20} body={F.white} top={F.action} />
      </g>
      <IsoBox iso={ISO} x={gx + 114} y={84} z={54} w={30} d={30} h={26} top={F.carbon} left={F.carbon} right={F.carbon} />
      <g className={styles.receipt}>
        <IsoPanel iso={ISO} x={gx + 118} y={98} z={80} w={22} h={50} />
      </g>
      <g className={styles.pop} style={cssVars({ d: 1 })}>
        <rect x={bx - 52} y={by - 18} width={104} height={36} rx={18} fill={F.mint} {...ISO_STROKE} />
        <text x={bx} y={by + 6} textAnchor="middle" className={styles.badge}>
          SUNAT ✓
        </text>
      </g>
    </>
  );
}

function Controla() {
  const gx = 4 * STEP;
  return (
    <>
      <IsoBox iso={ISO} x={gx + 90} y={70} w={20} d={20} h={34} top={F.carbon} left={F.carbon} right={F.carbon} />
      <IsoPanel iso={ISO} x={gx + 28} y={80} z={34} w={150} h={112}>
        <rect x={14} y={14} width={46} height={9} rx={4.5} fill={F.action} />
        <g className={styles.bars}>
          {[
            [16, 42],
            [40, 62],
            [64, 50],
            [88, 80],
          ].map(([x, h], k) => (
            <rect key={x} x={x} y={100 - h} width={16} height={h} rx={3} fill={k === 3 ? F.mint : F.violet} style={cssVars({ k })} />
          ))}
        </g>
        <circle cx={128} cy={52} r={14} fill="none" stroke={F.lav} strokeWidth={7} />
        <circle className={styles.arc} cx={128} cy={52} r={14} fill="none" stroke={F.mint} strokeWidth={7} pathLength={1} transform="rotate(-90 128 52)" />
      </IsoPanel>
    </>
  );
}

export function IsoJourney({ labels, className }: { labels: readonly string[]; className?: string }) {
  const anchors = JOURNEY_STATIONS.map((_, i) => center(i));
  const all = `${ALL.cx - ALL.w / 2} ${ALL.cy - ALL.w * 0.32} ${ALL.w} ${ALL.w * 0.64}`;
  return (
    <svg
      viewBox={all}
      className={[styles.scene, className].filter(Boolean).join(" ")}
      data-journey-svg
      data-camera={JSON.stringify(CAMERA)}
      data-anchors={JSON.stringify(anchors)}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable="false"
    >
      {/* Back to front: each conveyor sits between its island and the next one. */}
      <Island i={0} label={labels[0]}>
        <Compra />
      </Island>
      <Conveyor i={0} />
      <Island i={1} label={labels[1]}>
        <Stock />
      </Island>
      <Conveyor i={1} />
      <Island i={2} label={labels[2]}>
        <Produce />
      </Island>
      <Conveyor i={2} />
      <Island i={3} label={labels[3]}>
        <Vende />
      </Island>
      <Conveyor i={3} />
      <Island i={4} label={labels[4]}>
        <Controla />
      </Island>

      {/* The batch rides the route and becomes what each step produces. */}
      <g className={styles.token} data-journey-token>
        <g data-shape="compra">
          <rect x={-13} y={-13} width={26} height={26} rx={6} fill={F.surface} {...ISO_STROKE} />
          <path d="M-13 -3H13" stroke={F.violet} strokeWidth={3} />
        </g>
        <g data-shape="stock">
          <rect x={-13} y={-13} width={26} height={26} rx={6} fill={F.lav} {...ISO_STROKE} />
          <path d="M-6 0l4 4 8-8" fill="none" {...ISO_STROKE} />
        </g>
        <g data-shape="produce">
          <rect x={-10} y={-12} width={20} height={26} rx={5} fill={F.white} {...ISO_STROKE} />
          <rect x={-12} y={-18} width={24} height={8} rx={3} fill={F.action} {...ISO_STROKE} />
        </g>
        <g data-shape="vende">
          <path d="M-11 -15h22v30l-5.5-4-5.5 4-5.5-4-5.5 4z" fill={F.white} {...ISO_STROKE} />
          <circle cx={9} cy={-13} r={7} fill={F.mint} stroke={F.white} strokeWidth={2} />
        </g>
        <g data-shape="controla">
          <rect x={-14} y={-12} width={28} height={24} rx={6} fill={F.white} {...ISO_STROKE} />
          <path d="M-7 6V0M0 6V-5M7 6V-2" stroke={F.mint} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

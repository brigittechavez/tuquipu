import type { ReactNode } from "react";
import { ISO_FILL as F, ISO_STROKE, IsoBox, IsoCylinder, IsoPanel, cssVars, isoPoint, type Iso } from "./iso";
import styles from "./IsoPlantScape.module.css";

/**
 * Hero landscape: a panoramic 2.5D industrial park that reads as
 * one production process, left → right — inputs warehouse (truck arriving), silos,
 * main plant (chimney + steam), open filling line, finished-goods store, office with
 * the control panel, and a van leaving with the order. Everything sits on one
 * horizontal row (x + y = const), so motion along the process is purely horizontal.
 * Four tiny status pills light one at a time; no cards. CSS-only motion; reduced
 * motion shows one still, complete frame.
 */

const ISO: Iso = { ox: 1000, oy: 470 };
const R3 = 1.732;

/** World corner for an object of size w×d centred at screen offset u, row depth `dep`. */
const at = (u: number, w: number, d: number, dep = 0) => ({ x: u / R3 + dep / 2 - w / 2, y: -u / R3 + dep / 2 - d / 2 });
const pt = (u: number, dep = 0, z = 0) => isoPoint(ISO, u / R3 + dep / 2, -u / R3 + dep / 2, z);

/** A strip that runs along the row (road, conveyor): from u1 to u2, centred at `dep`. */
function RowStrip({ u1, u2, dep, width, z = 0, h = 0, fill, side = F.carbon }: { u1: number; u2: number; dep: number; width: number; z?: number; h?: number; fill: string; side?: string }) {
  const a = pt(u1, dep - width / 2, z + h);
  const b = pt(u2, dep - width / 2, z + h);
  const c = pt(u2, dep + width / 2, z + h);
  const d = pt(u1, dep + width / 2, z + h);
  const c0 = pt(u2, dep + width / 2, z);
  const d0 = pt(u1, dep + width / 2, z);
  const poly = (...p: [number, number][]) => p.map((q) => q.join(",")).join(" ");
  return (
    <g {...ISO_STROKE}>
      {h ? <polygon points={poly(d, c, c0, d0)} fill={side} /> : null}
      <polygon points={poly(a, b, c, d)} fill={fill} />
    </g>
  );
}

function Tree({ u, dep, s = 1 }: { u: number; dep: number; s?: number }) {
  const [x, y] = pt(u, dep);
  return (
    <g className={styles.tree} {...ISO_STROKE}>
      <path d={`M${x} ${y}V${y - 26 * s}`} />
      <circle cx={x} cy={y - 40 * s} r={17 * s} fill={F.lav} />
      <circle cx={x + 9 * s} cy={y - 48 * s} r={11 * s} fill={F.white} />
    </g>
  );
}

function Pill({ u, z, i, children }: { u: number; z: number; i: number; children: string }) {
  const [x, y] = pt(u, 0, z);
  // Width follows the label (≈8.6 units per character at 15px) so the text never spills out.
  const w = Math.round(58 + children.length * 8.6);
  const left = x - w / 2;
  return (
    <g className={styles.pill} style={cssVars({ i })}>
      <path d={`M${x} ${y + 30}V${y + 6}`} stroke={F.mint} strokeWidth={2} strokeDasharray="3 4" />
      <rect x={left} y={y - 36} width={w} height={40} rx={20} fill={F.white} {...ISO_STROKE} strokeWidth={2} />
      <circle cx={left + 22} cy={y - 16} r={10} fill={F.mint} />
      <path d={`M${left + 17} ${y - 16}l3.5 3.5 6.5-6.5`} fill="none" stroke={F.carbon} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <text x={left + 40} y={y - 10} className={styles.pillText}>
        {children}
      </text>
    </g>
  );
}

/* Products on the line: food, cosmetics, pigments, soap — they follow the hero's sector word. */
function Product({ x, y }: { x: number; y: number }) {
  const v = (s: number, el: ReactNode) => (
    <g key={s} className={styles.variant} style={cssVars({ s })}>
      {el}
    </g>
  );
  return (
    <>
      {v(0, <IsoCylinder iso={ISO} x={x} y={y} r={8} h={22} body={F.white} top={F.action} />)}
      {v(1, <IsoCylinder iso={ISO} x={x} y={y} r={11} h={12} body={F.lav} top={F.mint} />)}
      {v(2, <IsoCylinder iso={ISO} x={x} y={y} r={10} h={17} body={F.surface} top={F.violet} />)}
      {v(3, <IsoBox iso={ISO} x={x - 10} y={y - 7} w={20} d={14} h={8} top={F.lav} left={F.lav2} right={F.violet} />)}
    </>
  );
}

export function IsoPlantScape({ className }: { className?: string }) {
  const wh = at(-800, 160, 110);
  const plant = at(-300, 230, 140);
  const store = at(390, 170, 120);
  const office = at(640, 120, 100);
  const tank = at(-40, 0, 0);
  const [cx, cy] = isoPoint(ISO, plant.x + 190, plant.y + 30, 200);
  const belt0 = -10;
  const belt1 = 270;
  const beltDep = 70;
  const item = at(belt0 + 20, 0, 0, beltDep);
  const travel = belt1 - belt0 - 60;

  return (
    <svg viewBox="60 185 1880 445" className={[styles.scene, className].filter(Boolean).join(" ")} preserveAspectRatio="xMidYMax meet" aria-hidden focusable="false">
      <defs>
        <linearGradient id="scape-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles.groundTop} />
          <stop offset="1" className={styles.groundEnd} />
        </linearGradient>
        <radialGradient id="scape-glow" cx="50%" cy="100%" r="60%">
          <stop offset="0" className={styles.glowTop} />
          <stop offset="1" className={styles.glowEnd} />
        </radialGradient>
      </defs>

      {/* Sky glow and ground with a soft horizon, like a landscape. */}
      <ellipse cx={1000} cy={470} rx={1000} ry={300} fill="url(#scape-glow)" />
      <rect x={-200} y={470} width={2400} height={200} fill="url(#scape-ground)" />
      <path d="M-200 470H2200" stroke={F.carbon} strokeWidth={1.5} opacity={0.35} />
      {[505, 532, 556, 578].map((y, k) => (
        <path key={y} d={`M${120 + k * 90} ${y}H${1880 - k * 70}`} stroke={F.lav2} strokeWidth={1.5} strokeDasharray={`${180 - k * 30} ${60 + k * 20}`} className={styles.ground} />
      ))}

      {/* Back row of trees */}
      <Tree u={-960} dep={-90} s={0.9} />
      <Tree u={-540} dep={-110} s={1.1} />
      <Tree u={150} dep={-120} s={0.85} />
      <Tree u={880} dep={-100} />

      {/* 1 · Inputs warehouse */}
      <IsoBox iso={ISO} x={wh.x} y={wh.y} w={160} d={110} h={84} top={F.white} left={F.white} right={F.lav} />
      <IsoBox iso={ISO} x={wh.x - 4} y={wh.y - 4} z={84} w={168} d={118} h={8} top={F.lav} left={F.lav2} right={F.violet} />
      <IsoPanel iso={ISO} x={wh.x + 40} y={wh.y + 110} z={0} w={60} h={56} fill={F.lav} />
      <IsoCylinder iso={ISO} x={wh.x + 186} y={wh.y + 80} r={14} h={26} body={F.lav} top={F.lav2} />
      <IsoCylinder iso={ISO} x={wh.x + 206} y={wh.y + 56} r={12} h={22} body={F.lav} top={F.lav2} />

      {/* 2 · Silos, feeding the plant */}
      {[-640, -585, -530].map((u, k) => {
        const s = at(u, 0, 0, -20);
        return (
          <g key={u}>
            <IsoCylinder iso={ISO} x={s.x} y={s.y} r={24} h={150 - k * 14} body={F.white} top={k === 1 ? F.violet : F.lav} />
          </g>
        );
      })}
      <path d={`M${pt(-530, -20, 120).join(" ")}L${pt(-420, -20, 120).join(" ")}L${pt(-410, -20, 96).join(" ")}`} fill="none" stroke={F.carbon} strokeWidth={10} strokeLinejoin="round" />
      <path d={`M${pt(-530, -20, 120).join(" ")}L${pt(-420, -20, 120).join(" ")}L${pt(-410, -20, 96).join(" ")}`} fill="none" stroke={F.white} strokeWidth={5} strokeLinejoin="round" />
      <path className={styles.flow} d={`M${pt(-530, -20, 120).join(" ")}L${pt(-420, -20, 120).join(" ")}`} fill="none" stroke={F.mint} strokeWidth={2.5} strokeLinecap="round" />

      {/* 3 · Main plant: sawtooth roof, chimney with steam, lit windows */}
      <IsoBox iso={ISO} x={plant.x} y={plant.y} w={230} d={140} h={110} top={F.white} left={F.white} right={F.lav} />
      {[0, 1, 2, 3].map((k) => (
        <IsoBox key={k} iso={ISO} x={plant.x + k * 57} y={plant.y} z={110} w={57} d={140} h={k % 2 ? 10 : 22} top={k % 2 ? F.lav : F.lav2} left={F.lav} right={F.violet} />
      ))}
      {[0, 1, 2].map((k) => (
        <g key={k} className={styles.window} style={cssVars({ k })}>
          <IsoPanel iso={ISO} x={plant.x + 22 + k * 66} y={plant.y + 140} z={40} w={44} h={34} fill={F.lav} />
        </g>
      ))}
      <IsoCylinder iso={ISO} x={plant.x + 190} y={plant.y + 30} z={120} r={13} h={70} body={F.white} top={F.carbon} />
      <g className={styles.steam}>
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={cx} cy={cy} r={14 + k * 3} fill={F.white} stroke={F.lav2} strokeWidth={2} style={cssVars({ k })} />
        ))}
      </g>

      {/* 4 · Open filling line: mixing tank, filler, conveyor with products */}
      <IsoCylinder iso={ISO} x={tank.x} y={tank.y} r={40} h={104} body={F.white} top={F.lav} />
      <IsoBox iso={ISO} x={tank.x - 10} y={tank.y - 10} z={104} w={20} d={20} h={18} top={F.violet} left={F.action} right={F.violet} />
      <g className={styles.paddle}>
        <IsoBox iso={ISO} x={tank.x - 2} y={tank.y - 2} z={122} w={4} d={4} h={20} top={F.carbon} left={F.carbon} right={F.carbon} />
      </g>
      <RowStrip u1={belt0} u2={belt1} dep={beltDep} width={30} h={12} fill={F.carbon} side={F.carbon} />
      <g className={styles.belt} style={cssVars({ travel: `${travel}px` })}>
        {[0, 1, 2, 3].map((k) => (
          <g key={k} className={styles.item} style={cssVars({ k })}>
            <Product x={item.x} y={item.y} />
          </g>
        ))}
      </g>
      {(() => {
        const g = at(100, 0, 0, beltDep);
        return (
          <>
            <IsoBox iso={ISO} x={g.x - 18} y={g.y - 22} w={5} d={5} h={70} top={F.carbon} left={F.carbon} right={F.carbon} />
            <IsoBox iso={ISO} x={g.x + 14} y={g.y + 16} w={5} d={5} h={70} top={F.carbon} left={F.carbon} right={F.carbon} />
            <IsoBox iso={ISO} x={g.x - 18} y={g.y - 22} z={70} w={37} d={43} h={10} top={F.lav} left={F.lav2} right={F.violet} />
            <g className={styles.nozzle}>
              <IsoBox iso={ISO} x={g.x - 4} y={g.y - 4} z={48} w={9} d={9} h={22} top={F.violet} left={F.action} right={F.violet} />
            </g>
          </>
        );
      })()}

      {/* 5 · Finished goods store */}
      <IsoBox iso={ISO} x={store.x} y={store.y} w={170} d={120} h={92} top={F.white} left={F.white} right={F.lav} />
      <IsoBox iso={ISO} x={store.x - 4} y={store.y - 4} z={92} w={178} d={128} h={8} top={F.lav} left={F.lav2} right={F.violet} />
      <IsoPanel iso={ISO} x={store.x + 50} y={store.y + 120} z={0} w={64} h={58} fill={F.lav} />
      <IsoBox iso={ISO} x={store.x + 190} y={store.y + 60} w={30} d={30} h={26} top={F.surface} />
      <IsoBox iso={ISO} x={store.x + 194} y={store.y + 64} z={26} w={22} d={22} h={20} top={F.lav} left={F.lav2} right={F.violet} />

      {/* 6 · Office with the control panel */}
      <IsoBox iso={ISO} x={office.x} y={office.y} w={120} d={100} h={150} top={F.lav} left={F.white} right={F.lav} />
      <IsoPanel iso={ISO} x={office.x + 14} y={office.y + 100} z={60} w={92} h={70}>
        <rect x={10} y={10} width={30} height={6} rx={3} fill={F.action} />
        {[
          [12, 22],
          [28, 34],
          [44, 28],
          [60, 46],
        ].map(([x, h], k) => (
          <rect key={x} className={styles.bar} x={x} y={62 - h} width={11} height={h} rx={2} fill={k === 3 ? F.mint : F.violet} style={cssVars({ k })} />
        ))}
      </IsoPanel>
      <IsoPanel iso={ISO} x={office.x + 40} y={office.y + 100} z={0} w={36} h={44} fill={F.lav} />

      {/* Front row of trees */}
      <Tree u={-700} dep={150} s={0.8} />
      <Tree u={520} dep={150} s={0.9} />

      {/* Road in front: the truck brings inputs, the van leaves with the order */}
      <RowStrip u1={-1300} u2={1300} dep={200} width={56} fill={F.white} />
      <path d={`M${pt(-1300, 200, 1).join(" ")}L${pt(1300, 200, 1).join(" ")}`} stroke={F.lav2} strokeWidth={2} strokeDasharray="22 18" />
      <g className={styles.truck}>
        {(() => {
          const t = at(-860, 70, 36, 200);
          return (
            <>
              <IsoBox iso={ISO} x={t.x} y={t.y} w={70} d={36} h={40} top={F.white} left={F.white} right={F.lav} />
              <IsoBox iso={ISO} x={t.x + 70} y={t.y + 2} w={26} d={32} h={28} top={F.lav} left={F.lav2} right={F.violet} />
              <IsoPanel iso={ISO} x={t.x + 10} y={t.y + 36} z={22} w={36} h={6} fill={F.action} />
            </>
          );
        })()}
      </g>
      <g className={styles.van}>
        {(() => {
          const v = at(760, 56, 32, 200);
          return (
            <>
              <IsoBox iso={ISO} x={v.x} y={v.y} w={56} d={32} h={34} top={F.white} left={F.white} right={F.lav} />
              <IsoBox iso={ISO} x={v.x + 56} y={v.y + 2} w={20} d={28} h={24} top={F.mint} left={F.mint} right="#17a99b" />
            </>
          );
        })()}
      </g>

      {/* What Tu Quipu records at each step — one at a time. */}
      <Pill u={-800} z={150} i={0}>
        Insumos recibidos
      </Pill>
      <Pill u={-300} z={230} i={1}>
        Lote producido
      </Pill>
      <Pill u={390} z={160} i={2}>
        Comprobante aceptado
      </Pill>
      <Pill u={640} z={225} i={3}>
        Reporte al día
      </Pill>
    </svg>
  );
}

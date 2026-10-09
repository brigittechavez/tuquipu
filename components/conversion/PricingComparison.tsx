import { Check, Minus, Plus } from "lucide-react";
import { SOON, comparison, plans, pricingCopy, type ComparisonRow, type ComparisonValue } from "@/content/pricing";
import styles from "./Pricing.module.css";

function Value({ value }: { value: ComparisonValue }) {
  if (value === true)
    return (
      <>
        <Check aria-hidden className={styles.yes} />
        <span className="visually-hidden">Incluido</span>
      </>
    );
  if (value === false)
    return (
      <>
        <Minus aria-hidden className={styles.no} />
        <span className="visually-hidden">No incluido</span>
      </>
    );
  if (value === SOON) return <span className={styles.soon}>{SOON}</span>;
  return <span className={styles.textValue}>{value}</span>;
}

const same = (row: ComparisonRow) => plans.every((p) => row.values[p.id] === row.values[plans[0].id]);

/** True when this plan's value changes from the previous plan's (and is not "not included"). */
function grows(row: ComparisonRow, index: number): boolean {
  if (index === 0) return false;
  const v = row.values[plans[index].id];
  return v !== false && v !== row.values[plans[index - 1].id];
}

/** Everything the three plans share, said once when only differences are shown. */
const shared = comparison.flatMap((g) => g.rows.filter(same).map((r) => r.label));
const sharedText = `Incluido en los tres planes: ${shared.join(", ").toLowerCase()}.`;

/**
 * Full matrix behind "Comparar planes". "Solo diferencias" (on by default,
 * CSS-only) hides what every plan shares and marks each value that grows from the
 * previous plan, so Operaciones → Industria reads as a real jump.
 */
export function PricingComparison() {
  return (
    <details className={styles.compare} data-pricing-interaction="compare_open">
      <summary className={styles.compareSummary}>
        <Plus aria-hidden className={styles.compareIcon} />
        {pricingCopy.compareLabel}
      </summary>

      <label className={styles.filter}>
        <input type="checkbox" defaultChecked />
        Solo diferencias
      </label>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="visually-hidden">Comparación de planes de Tu Quipu</caption>
          <thead>
            <tr>
              <th scope="col">Capacidad</th>
              {plans.map((p) => (
                <th scope="col" key={p.id}>
                  {p.name}
                  {p.recommended ? <span className={styles.tableBadge}> · {pricingCopy.recommendedBadge}</span> : null}
                </th>
              ))}
            </tr>
          </thead>
          {comparison.map((group) => (
            <tbody key={group.title} data-all-same={group.rows.every(same) || undefined}>
              <tr className={styles.groupRow}>
                <th scope="colgroup" colSpan={plans.length + 1}>
                  {group.title}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} data-same={same(row) || undefined}>
                  <th scope="row">{row.label}</th>
                  {plans.map((p, i) => (
                    <td key={p.id} data-up={grows(row, i) || undefined}>
                      <Value value={row.values[p.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
          <tbody>
            <tr className={styles.sameNote}>
              <th scope="row" colSpan={plans.length + 1}>
                {sharedText}
              </th>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.stackCompare}>
        <p className={styles.sameNote}>{sharedText}</p>
        {plans.map((p, i) => (
          <section key={p.id} className={styles.stackPlan} aria-labelledby={`compare-${p.id}`}>
            <h4 id={`compare-${p.id}`} className={styles.stackTitle}>
              {p.name}
              {p.recommended ? <span className={styles.badge}>{pricingCopy.recommendedBadge}</span> : null}
            </h4>
            {comparison.map((group) => (
              <div key={group.title} data-all-same={group.rows.every(same) || undefined}>
                <p className={styles.stackGroup}>{group.title}</p>
                <dl className={styles.stackList}>
                  {group.rows.map((row) => (
                    <div key={row.label} data-same={same(row) || undefined}>
                      <dt>{row.label}</dt>
                      <dd data-up={grows(row, i) || undefined}>
                        <Value value={row.values[p.id]} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </section>
        ))}
      </div>
    </details>
  );
}

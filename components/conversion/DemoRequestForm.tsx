"use client";

import { CircleCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitLeadAction } from "@/app/demo/actions";
import { ctas } from "@/content/ctas";
import { plans } from "@/content/pricing";
import type { LeadIntent, PlanId } from "@/content/types";
import { Kappi } from "@/components/illustration/Kappi";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { buttonClass } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import type { LeadFormState } from "@/lib/leads/submit";
import { LIMITS, validateLead, type LeadErrors, type LeadField } from "@/lib/validation/lead";
import { FormField } from "./FormField";
import { LeadConfirmation } from "./LeadConfirmation";
import styles from "./DemoRequestForm.module.css";

const FORM_ID = "demo_request";
const FIELD_ORDER: LeadField[] = ["name", "company", "phone", "email", "activity", "plan", "need", "consent"];

type Props = {
  intent: LeadIntent;
  plan?: PlanId;
  source: string;
  startedAt: number;
};

function planName(id?: string) {
  return plans.find((p) => p.id === id)?.name;
}

export function DemoRequestForm({ intent: initialIntent, plan: initialPlan, source, startedAt }: Props) {
  const [state, formAction, pending] = useActionState<LeadFormState, FormData>(submitLeadAction, { status: "idle" });
  const [clientErrors, setClientErrors] = useState<LeadErrors>({});
  const [intent, setIntent] = useState<LeadIntent>(initialIntent);
  const started = useRef(false);
  const leadTracked = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const serverErrors = state.status === "invalid" ? state.errors : {};
  const errors: LeadErrors = { ...serverErrors, ...clientErrors };
  const values = "values" in state ? state.values : undefined;

  useEffect(() => {
    if (state.status === "success") {
      if (!leadTracked.current) {
        leadTracked.current = true;
        // Only after a real server confirmation, never with personal data.
        track("generate_lead", {
          form_id: FORM_ID,
          source: state.lead.source,
          lead_type: state.lead.intent,
          plan_id: state.lead.plan,
        });
      }
      successRef.current?.focus();
      window.dispatchEvent(new CustomEvent("tq:lead-success"));
    } else if (state.status === "error" || state.status === "unavailable") {
      statusRef.current?.focus();
    } else if (state.status === "invalid") {
      focusFirstInvalid(state.errors);
    }
  }, [state]);

  function focusFirstInvalid(errs: LeadErrors) {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  function onFirstInput() {
    if (started.current) return;
    started.current = true;
    track("demo_form_start", { form_id: FORM_ID, source });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (pending) {
      event.preventDefault();
      return;
    }
    const data = new FormData(event.currentTarget);
    const text = (k: string) => String(data.get(k) ?? "");
    const found = validateLead({
      intent,
      plan: (text("plan") || undefined) as PlanId | undefined,
      source,
      name: text("name"),
      company: text("company"),
      phone: text("phone"),
      email: text("email"),
      activity: text("activity"),
      need: text("need"),
      consent: data.get("consent") === "on",
    });
    setClientErrors(found);
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      focusFirstInvalid(found);
    }
  }

  function clearError(field: LeadField) {
    if (!clientErrors[field]) return;
    setClientErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  if (state.status === "success") {
    const name = planName(state.lead.plan);
    return (
      <div className={styles.success} role="status">
        <div className={styles.successKappi} aria-hidden>
          <Kappi pose="closure" size={140} motion="enter" facing="left" />
        </div>
        <CircleCheck aria-hidden className={styles.successIcon} />
        <h2 ref={successRef} tabIndex={-1} className={styles.successTitle}>
          Recibimos tu solicitud
        </h2>
        <p>
          {state.lead.intent === "quote"
            ? `Te contactaremos para preparar la cotización${name ? ` del plan ${name}` : ""}.`
            : "Te contactaremos para coordinar una demo guiada con tu operación como punto de partida."}{" "}
          No se creó ninguna cuenta.
        </p>
        <p className={styles.successRef}>
          Código de solicitud: <strong>{state.lead.reference}</strong>
        </p>
        <Link href="/" className={buttonClass("secondary")}>
          Volver al inicio
        </Link>
        <LeadConfirmation intent={state.lead.intent} planName={name} reference={state.lead.reference} />
      </div>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;
  const defaultPlan = values?.plan ?? initialPlan ?? "";

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      onInput={onFirstInput}
      noValidate
      className={styles.form}
      aria-describedby="form-required-note"
    >
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="tq_hp">No completes este campo</label>
        <input id="tq_hp" name="tq_hp" type="text" tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" />
      </div>

      <div ref={statusRef} tabIndex={-1} className={styles.statusRegion} aria-live="polite" aria-atomic="true">
        {state.status === "unavailable" ? (
          <div className={`${styles.status} ${styles.statusWarn}`}>
            <TriangleAlert aria-hidden className={styles.statusIcon} />
            <div>
              <p className={styles.statusTitle}>Tu solicitud no se envió.</p>
              <p>El envío en línea aún no está activo. Escríbenos por WhatsApp y te respondemos por ahí.</p>
              <WhatsAppLink cta={ctas.demo_whatsapp} size="small" className={styles.statusAction} />
            </div>
          </div>
        ) : state.status === "error" ? (
          <div className={`${styles.status} ${styles.statusError}`}>
            <TriangleAlert aria-hidden className={styles.statusIcon} />
            <p>{state.message}</p>
          </div>
        ) : errorCount > 0 ? (
          <p className={`${styles.status} ${styles.statusError}`}>
            <TriangleAlert aria-hidden className={styles.statusIcon} />
            Revisa {errorCount === 1 ? "1 campo" : `${errorCount} campos`} marcados abajo.
          </p>
        ) : null}
      </div>

      <fieldset className={styles.intent}>
        <legend className={styles.label}>¿Qué necesitas?</legend>
        <div className={styles.segmented}>
          {(
            [
              ["demo", "Una demo guiada"],
              ["quote", "Cotizar un plan"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className={styles.segment}>
              <input
                type="radio"
                name="intent"
                value={value}
                checked={intent === value}
                onChange={() => setIntent(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.grid}>
        <FormField id="name" label="Nombre" error={errors.name}>
          {(d, invalid) => (
            <input id="name" name="name" type="text" autoComplete="name" maxLength={LIMITS.name} defaultValue={values?.name} aria-describedby={d} aria-invalid={invalid || undefined} onChange={() => clearError("name")} className={styles.input} required />
          )}
        </FormField>
        <FormField id="company" label="Empresa" error={errors.company}>
          {(d, invalid) => (
            <input id="company" name="company" type="text" autoComplete="organization" maxLength={LIMITS.company} defaultValue={values?.company} aria-describedby={d} aria-invalid={invalid || undefined} onChange={() => clearError("company")} className={styles.input} required />
          )}
        </FormField>
        <FormField id="phone" label="WhatsApp o teléfono" error={errors.phone}>
          {(d, invalid) => (
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={LIMITS.phone} defaultValue={values?.phone} aria-describedby={d} aria-invalid={invalid || undefined} onChange={() => clearError("phone")} className={styles.input} required />
          )}
        </FormField>
        <FormField id="email" label="Correo" error={errors.email}>
          {(d, invalid) => (
            <input id="email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={LIMITS.email} defaultValue={values?.email} aria-describedby={d} aria-invalid={invalid || undefined} onChange={() => clearError("email")} className={styles.input} required />
          )}
        </FormField>
        <FormField id="activity" label="Actividad de tu empresa" help="Por ejemplo: fabricamos productos de limpieza." error={errors.activity} className={styles.wide}>
          {(d, invalid) => (
            <input id="activity" name="activity" type="text" maxLength={LIMITS.activity} defaultValue={values?.activity} aria-describedby={d} aria-invalid={invalid || undefined} onChange={() => clearError("activity")} className={styles.input} required />
          )}
        </FormField>
        <fieldset
          className={[styles.planGroup, styles.wide, errors.plan && styles.fieldInvalid].filter(Boolean).join(" ")}
          aria-describedby={errors.plan ? "plan-error" : undefined}
          key={defaultPlan}
        >
          <legend className={styles.label}>
            {intent === "quote" ? "Plan a cotizar" : "Plan de interés"}
            {intent !== "quote" ? <span className={styles.optional}> (opcional)</span> : null}
          </legend>
          <div className={styles.planOptions}>
            {[{ id: "", name: "Aún no lo sé", detail: "Te ayudamos a elegir" }, ...plans.map((p) => ({ id: p.id, name: p.name, detail: `${p.currency}${p.price} ${p.priceSuffix}` }))].map((option) => (
              <label key={option.id || "none"} className={styles.planOption}>
                <input type="radio" name="plan" value={option.id} defaultChecked={defaultPlan === option.id} />
                <span className={styles.planCard}>
                  <span className={styles.planName}>{option.name}</span>
                  <span className={styles.planDetail}>{option.detail}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.plan ? (
            <p id="plan-error" className={styles.error}>
              {errors.plan}
            </p>
          ) : null}
        </fieldset>
        <FormField id="need" label="¿Qué te gustaría resolver?" optional error={errors.need} className={styles.wide}>
          {(d, invalid) => (
            <textarea id="need" name="need" rows={4} maxLength={LIMITS.need} defaultValue={values?.need} aria-describedby={d} aria-invalid={invalid || undefined} className={styles.input} />
          )}
        </FormField>
      </div>

      <div className={`${styles.consent} ${errors.consent ? styles.fieldInvalid : ""}`}>
        <input
          id="consent"
          name="consent"
          type="checkbox"
          defaultChecked={values?.consent}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          aria-invalid={errors.consent ? true : undefined}
          onChange={() => clearError("consent")}
          required
        />
        <label htmlFor="consent">
          Acepto que Tu Quipu use estos datos para contactarme sobre esta solicitud, según la{" "}
          <Link href="/privacidad">política de privacidad</Link>.
        </label>
        {errors.consent ? (
          <p id="consent-error" className={styles.error}>
            {errors.consent}
          </p>
        ) : null}
      </div>

      <p id="form-required-note" className={styles.required}>
        Todos los campos son obligatorios salvo los marcados como opcionales.
      </p>

      <button type="submit" className={buttonClass("primary", "regular", false, styles.submit)} aria-disabled={pending || undefined} data-state={pending ? "loading" : "idle"}>
        {pending ? (
          // eslint-disable-next-line @next/next/no-img-element -- approved button loader
          <img src="/assets/loading/button-loader.svg" alt="" width={20} height={20} className={styles.loader} />
        ) : null}
        {intent === "quote" ? "Solicitar cotización" : "Solicitar demo"}
        {pending ? <span className="visually-hidden"> (enviando)</span> : null}
      </button>
    </form>
  );
}

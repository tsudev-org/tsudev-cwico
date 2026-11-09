/**
 * The confirmation step.
 *
 * This dialog exists because a debloater's worst outcome is a user who did
 * not realise what they had selected. So it shows, in order: what will be
 * backed up first, exactly which items go and by which steps, and - most
 * importantly - what the engine *refused* to do and why. A silently dropped
 * selection would teach users that the checkbox is a suggestion.
 */

import type { Locale, RemovalPlan } from "../types";
import { kindLabel, translator } from "../i18n";
import { Button, Modal, Notice, SafetyBadge } from "./primitives";
import { Pager } from "./Pager";
import { usePaged } from "../pagination";

interface Props {
  open: boolean;
  plan: RemovalPlan | null;
  locale: Locale;
  busy: boolean;
  onClose: () => void;
  onDryRun: () => void;
  onExecute: () => void;
}

export function PlanDialog({
  open,
  plan,
  locale,
  busy,
  onClose,
  onDryRun,
  onExecute,
}: Props) {
  const t = translator(locale);
  if (!plan) return null;

  const totalSteps =
    plan.preamble.length +
    plan.items.reduce((sum, item) => sum + item.steps.length, 0);

  return (
    <Modal
      open={open}
      title={t("plan.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {t("action.cancel")}
          </Button>
          <Button variant="outline" onClick={onDryRun} disabled={busy || !plan.items.length}>
            {t("action.preview")}
          </Button>
          <Button
            variant="danger"
            onClick={onExecute}
            disabled={busy || !plan.items.length}
          >
            {t("action.remove")} ({plan.items.length})
          </Button>
        </>
      }
    >
      {plan.items.length === 0 ? (
        <Notice tone="warning" title={t("plan.empty")} />
      ) : (
        <>
          <Notice tone="warning" title={t("plan.confirmTitle")}>
            {t("plan.confirmBody")}
          </Notice>

          {plan.preamble.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {plan.preamble.map((step) => (
                <li
                  key={step.kind}
                  className="flex items-center gap-2 text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span style={{ color: "var(--success)" }}>✓</span>
                  {step.kind === "createRestorePoint"
                    ? t("plan.restorePoint")
                    : t("plan.registryBackup")}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 mb-2 text-[13px]" style={{ color: "var(--text-muted)" }}>
            {plan.items.length} × {t("scan.itemsFound")} · {totalSteps} {t("plan.steps")}
          </p>

          <PlanItems items={plan.items} locale={locale} />
        </>
      )}

      {plan.rejected.length > 0 && (
        <>
          <h3 className="mt-6 mb-2 text-sm font-semibold">{t("plan.rejected")}</h3>
          <ul className="space-y-2">
            {plan.rejected.map((rejection) => (
              <li
                key={rejection.itemId}
                className="rounded-lg border px-3.5 py-2.5"
                style={{
                  borderColor:
                    rejection.code === "protected_component"
                      ? "color-mix(in srgb, var(--danger) 35%, transparent)"
                      : "var(--border-subtle)",
                  background:
                    rejection.code === "protected_component"
                      ? "color-mix(in srgb, var(--danger) 7%, transparent)"
                      : "var(--surface-sunken)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">
                    {rejection.code === "protected_component" ? "⛊" : "⚠"}
                  </span>
                  <span className="text-sm font-medium">{rejection.name}</span>
                  <code
                    className="rounded px-1 text-[11px]"
                    style={{ background: "var(--surface-panel)", color: "var(--text-muted)" }}
                  >
                    {rejection.code}
                  </code>
                </div>
                <p className="mt-1 text-[12px]" style={{ color: "var(--text-secondary)" }}>
                  {rejection.detail}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Modal>
  );
}

/** The plan's items, paged inside their own frame (DATA_TABLE: modals too). */
function PlanItems({ items, locale }: { items: RemovalPlan["items"]; locale: Locale }) {
  const t = translator(locale);
  const paged = usePaged("plan", items, String(items.length));
  return (
    <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
    <ul
      className="divide-y"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      {paged.pageItems.map((item) => (
        <li
          key={item.itemId}
          className="px-3.5 py-2.5"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <SafetyBadge safety={item.safety} locale={locale} compact />
            <span className="text-sm font-medium">{item.name}</span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {kindLabel(locale, item.source)}
            </span>
          </div>
          <ol
            className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]"
            style={{ color: "var(--text-muted)" }}
          >
            {item.steps.map((step, index) => (
              <li
                key={`${item.itemId}-${step.kind}-${index}`}
                className="rounded px-1.5 py-0.5 font-mono"
                style={{ background: "var(--surface-sunken)" }}
              >
                {index + 1}. {step.kind}
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ul>
      <Pager paged={paged} locale={locale} label={t("pager.plan")} />
    </div>
  );
}

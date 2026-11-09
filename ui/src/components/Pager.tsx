/**
 * The footer of a record list: page-size picker on the LEFT, summary in the
 * MIDDLE, page buttons on the RIGHT (tsudev DATA_TABLE sections 3, 6, 7).
 *
 * The picker never moves - not on a narrow window, not in a modal. Below
 * 640px the footer wraps to two rows with the picker still first.
 */

import type { Locale } from "../types";
import { translator } from "../i18n";
import { PAGE_SIZES, pageCells, type PageSize, type Paged } from "../pagination";

export function Pager<T>({
  paged,
  locale,
  label,
  unfilteredTotal,
  selectedCount = 0,
  onClearSelection,
}: {
  paged: Paged<T>;
  locale: Locale;
  /** Names the list for screen readers: "Số bản ghi mỗi trang - Phần mềm". */
  label: string;
  /** Total before filtering; shown as "(lọc từ N)" when it differs. */
  unfilteredTotal?: number;
  selectedCount?: number;
  onClearSelection?: () => void;
}) {
  const t = translator(locale);
  const nf = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");
  const { page, pageCount, pageSize, first, total } = paged;
  const last = Math.min(first + pageSize, total);

  let summary = "";
  if (selectedCount > 0) summary = t("pager.selected").replace("{n}", nf.format(selectedCount));
  else if (total === 0) summary = "";
  else if (pageCount === 1) summary = `${nf.format(total)} ${t("pager.items")}`;
  else summary = `${nf.format(first + 1)}-${nf.format(last)} / ${nf.format(total)}`;
  if (!selectedCount && total > 0 && unfilteredTotal !== undefined && unfilteredTotal !== total) {
    summary += ` ${t("pager.filteredFrom").replace("{n}", nf.format(unfilteredTotal))}`;
  }

  const announce = total
    ? t("pager.announce")
        .replace("{from}", nf.format(first + 1))
        .replace("{to}", nf.format(last))
        .replace("{total}", nf.format(total))
    : "";

  const cell =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-[13px] tabular-nums disabled:cursor-not-allowed disabled:opacity-40";
  const cellStyle = { borderColor: "var(--border-subtle)", background: "var(--surface-panel)", color: "var(--text-primary)" };

  return (
    <div
      className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-2 border-t px-4 py-1.5"
      style={{ borderColor: "var(--border-subtle)", background: "var(--surface-sunken)" }}
    >
      {/* LEFT: the picker - always first, always bottom-left. */}
      <div className="flex items-center gap-2">
        <select
          aria-label={`${t("pager.label")} - ${label}`}
          value={pageSize}
          onChange={(event) => paged.setPageSize(Number(event.target.value) as PageSize)}
          className="h-8 rounded-md border px-2 text-[13px]"
          style={cellStyle}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-[13px]" style={{ color: "var(--text-muted)" }} aria-hidden="true">
          {t("pager.perPage")}
        </span>
      </div>

      {/* MIDDLE: summary. */}
      <div className="flex flex-1 items-center justify-end gap-2 text-[13px] sm:justify-center" style={{ color: "var(--text-muted)" }}>
        <span>{summary}</span>
        {selectedCount > 0 && onClearSelection && (
          <button type="button" onClick={onClearSelection} className="underline" style={{ color: "var(--text-secondary)" }}>
            {t("select.none")}
          </button>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>

      {/* RIGHT: pages. Hidden only when there is a single page. */}
      {pageCount > 1 && (
        <nav aria-label={t("pager.nav")} className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-end">
          <button
            type="button"
            className={cell}
            style={cellStyle}
            disabled={page <= 1}
            aria-label={t("pager.prev")}
            onClick={() => paged.setPage(page - 1)}
          >
            ‹
          </button>
          <span className="hidden items-center gap-1 sm:flex">
            {pageCells(page, pageCount).map((n, i) =>
              n === null ? (
                <span key={`gap-${i}`} className="px-1 text-[13px]" style={{ color: "var(--text-muted)" }}>
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  className={cell}
                  aria-current={n === page ? "page" : undefined}
                  style={
                    n === page
                      ? { ...cellStyle, background: "var(--color-tsu-600)", borderColor: "var(--color-tsu-600)", color: "#fff" }
                      : cellStyle
                  }
                  onClick={() => paged.setPage(n)}
                >
                  {nf.format(n)}
                </button>
              ),
            )}
          </span>
          <button
            type="button"
            className={cell}
            style={cellStyle}
            disabled={page >= pageCount}
            aria-label={t("pager.next")}
            onClick={() => paged.setPage(page + 1)}
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}

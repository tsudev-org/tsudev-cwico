/**
 * Record-list paging, per the tsudev DATA_TABLE standard.
 *
 * Every list that can grow past ten rows gets a page-size picker in its
 * bottom-left corner: 10 / 20 / 50 / 100 / 200, default 10, remembered per
 * list. A real scan returns hundreds of items (631 on the first live machine),
 * which is exactly the list the standard exists for.
 *
 * The data is already on the machine, so paging slices in memory - there is no
 * server round trip to save, but the picker still bounds how many rows React
 * renders at once.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

export const PAGE_SIZES = [10, 20, 50, 100, 200] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 10;

const storageKey = (table: string) => `tsudev.pagesize.${table}`;

export function isPageSize(value: unknown): value is PageSize {
  return PAGE_SIZES.includes(value as PageSize);
}

/**
 * The remembered size for one list. Kept in the WebView's storage, which lives
 * in the app's per-user data folder - not the registry, not the install
 * folder. A missing, unreadable or out-of-range value falls back to 10.
 */
export function readPageSize(table: string): PageSize {
  try {
    const raw = Number(window.localStorage.getItem(storageKey(table)));
    return isPageSize(raw) ? raw : DEFAULT_PAGE_SIZE;
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
}

function savePageSize(table: string, size: PageSize) {
  try {
    window.localStorage.setItem(storageKey(table), String(size));
  } catch {
    // Storage blocked: the choice simply is not remembered.
  }
}

/** 1-based page that keeps `firstIndex` (0-based) on screen after a size change. */
export function pageKeeping(firstIndex: number, size: number): number {
  return Math.floor(firstIndex / size) + 1;
}

/**
 * At most seven cells: `1 … 5 6 7 … 13`. `null` is an ellipsis.
 */
export function pageCells(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 3) return [1, null, total - 4, total - 3, total - 2, total - 1, total];
  return [1, null, current - 1, current, current + 1, null, total];
}

export interface Paged<T> {
  pageItems: T[];
  page: number;
  pageCount: number;
  pageSize: PageSize;
  /** 0-based index of the first row shown. */
  first: number;
  total: number;
  setPage: (page: number) => void;
  setPageSize: (size: PageSize) => void;
}

/**
 * Page `rows`. `resetKey` changes when a filter or the search changes; that
 * goes back to page 1 but keeps the chosen size.
 */
export function usePaged<T>(table: string, rows: T[], resetKey: string): Paged<T> {
  const [pageSize, setSize] = useState<PageSize>(() => readPageSize(table));
  const [page, setPageRaw] = useState(1);

  useEffect(() => setPageRaw(1), [resetKey]);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageCount);
  const first = (current - 1) * pageSize;
  const pageItems = useMemo(() => rows.slice(first, first + pageSize), [rows, first, pageSize]);

  const setPage = useCallback(
    (next: number) => setPageRaw(Math.min(Math.max(1, next), pageCount)),
    [pageCount],
  );
  const setPageSize = useCallback(
    (size: PageSize) => {
      setPageRaw(pageKeeping(first, size));
      setSize(size);
      savePageSize(table, size);
    },
    [first, table],
  );

  return { pageItems, page: current, pageCount, pageSize, first, total, setPage, setPageSize };
}

/**
 * The last line of defence against a blank window.
 *
 * Without a boundary, one exception thrown while rendering unmounts the whole
 * React tree and leaves an empty white WebView with no message and no way
 * forward. That is exactly what the first scan of a real machine produced on
 * 09/11/2026 (a field the fixtures always filled was missing). For a tool that
 * runs with Administrator rights mid-way through changing the system, "the
 * window went white" is the worst possible report: the user cannot tell
 * whether anything was changed.
 *
 * This screen says what happened, that nothing is removed by a display error,
 * where the rollback artefacts are, and shows the error text for a bug report.
 * It is bilingual and self-contained on purpose: it must not depend on any
 * state of the app it is replacing.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Brand } from "./Brand";
import { Button } from "./primitives";

const ISSUES_URL = "https://github.com/tsudev-org/tsudev-cwico/issues/new";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Kept in the WebView console for anyone attaching DevTools to a debug build.
    console.error("cwico: render error", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const details = `${error.name}: ${error.message}\n${(error.stack ?? "").split("\n").slice(0, 6).join("\n")}`;
    return (
      <div role="alert" className="flex min-h-screen items-center justify-center bg-[var(--surface-app)] p-6">
        <div className="w-full max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-6 shadow-sm">
          <Brand size="md" />
          <h1 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
            Giao diện gặp lỗi hiển thị
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">The interface hit a display error.</p>
          <p className="mt-4 text-sm text-[var(--text-primary)]">
            Lỗi hiển thị không gỡ hay thay đổi gì trên máy. Nếu một lượt gỡ đang chạy, điểm khôi phục,
            bản sao lưu <code>.reg</code> và nhật ký giao dịch vẫn nằm trong thư mục sao lưu. Tải lại để
            tiếp tục, và báo lỗi kèm nội dung bên dưới để dự án sửa.
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            A display error removes or changes nothing. Reload to continue, and report the text below.
          </p>
          <p className="mt-2 select-all text-sm text-[var(--text-secondary)]">{ISSUES_URL}</p>
          <pre
            tabIndex={0}
            className="mt-4 max-h-40 overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-3 text-xs text-[var(--text-secondary)]"
          >
            {details}
          </pre>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Tải lại / Reload
            </Button>
            <Button onClick={() => void navigator.clipboard?.writeText(details)}>
              Chép nội dung lỗi / Copy details
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

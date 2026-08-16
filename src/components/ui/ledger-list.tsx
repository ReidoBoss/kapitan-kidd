import type { ReactNode } from "react";

/**
Ruled ledger list: hairline rows with shared loading and empty states.
*/
export function LedgerList<T>({
  items,
  getKey,
  renderItem,
  emptyText,
  loading = false,
  loadingText = "Loading…",
  className = "mt-4 border-t border-rule",
  rowClassName = "py-2",
}: {
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  emptyText: string;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  rowClassName?: string;
}) {
  return (
    <ul className={className}>
      {loading && (
        <li className="py-2 text-sm italic text-muted">{loadingText}</li>
      )}
      {!loading && items.length === 0 && (
        <li className="py-2 text-sm italic text-muted">{emptyText}</li>
      )}
      {!loading &&
        items.map((item) => (
          <li
            key={getKey(item)}
            className={`border-b border-rule ${rowClassName}`}
          >
            {renderItem(item)}
          </li>
        ))}
    </ul>
  );
}

import { IngestionStatus } from "@/types/ingestion/IngestionJob";

/** Tailwind classes for a pill‑style badge per status */
export const ingestionStatusClasses: Record<IngestionStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-800",
  running: "bg-blue-100 text-blue-800 border border-blue-800",
  done: "bg-green-100 text-green-800 border border-green-800",
  failed: "bg-red-100 text-red-800 border border-red-800",
};

export default function IngestionStatusBadge({ status }: { status: IngestionStatus }) {
  const classes = ingestionStatusClasses[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-lg ${classes}`}
    >
      {label}
    </span>
  );
}
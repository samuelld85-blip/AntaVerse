import { isTodo } from "@/lib/legal/legal-config";

/**
 * Renders a legal-config value, or a visibly-marked placeholder when the
 * value is still TODO_BEFORE_STORE_RELEASE — so an unfilled legal field can
 * never silently look like real, complete information in the shipped app.
 */
export function TodoValue({ value, label }: { value: string; label?: string }) {
  if (!isTodo(value)) return <>{value}</>;
  return <span className="legal-todo">{label ?? "à renseigner avant publication"}</span>;
}

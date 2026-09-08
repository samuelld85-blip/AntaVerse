import styles from "./sport.module.css";
import type { StatusDefinition } from "./progression";

type ProgressionBadgeProps =
  | { kind: "status"; status: StatusDefinition; compact?: boolean }
  | { kind: "exercise"; level: number; compact?: boolean };

export function ProgressionBadge(props: ProgressionBadgeProps) {
  const isStatus = props.kind === "status";
  const label = isStatus ? props.status.label : `Niveau ${props.level}`;
  const icon = isStatus ? props.status.icon : "✦";
  return (
    <span
      className={`${styles.progressionBadge} ${isStatus ? styles.statusBadge : styles.exerciseBadge} ${props.compact ? styles.progressionBadgeCompact : ""}`}
      title={isStatus ? `Statut global : ${label}` : `Niveau d’exercice : ${label}`}
    >
      <span className={styles.progressionBadgeIcon} aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </span>
  );
}

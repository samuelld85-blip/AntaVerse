import type { CSSProperties, InputHTMLAttributes, ReactNode, Ref } from "react";
import "./participant-setup.css";

export interface ParticipantCardProps {
  /** Badge content — a letter ("A") for teams, a number ("1") for players. */
  badge: ReactNode;
  /** Drives the badge, side bar, tinted gradient and remove-hover accent. */
  color: string;
  /** Small uppercase label above the name field ("Équipe A", "Joueur 2"...). */
  label: string;
  error?: string;
  onRemove?: () => void;
  removeLabel?: string;
  /** Spread onto the underlying <input> — supports both controlled state and a ref-based form library's register(). */
  inputProps: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> };
  /** Badge text color when the default dark ink doesn't have enough contrast. */
  badgeInk?: string;
}

export function ParticipantCard({
  badge,
  color,
  label,
  error,
  onRemove,
  removeLabel = "Retirer",
  inputProps,
  badgeInk,
}: ParticipantCardProps) {
  const style = {
    "--av-color": color,
    ...(badgeInk ? { "--av-badge-ink": badgeInk } : {}),
  } as CSSProperties;

  return (
    <div
      className={`av-participant-card${onRemove ? " av-participant-card--removable" : ""}`}
      style={style}
    >
      <span className="av-participant-bar" aria-hidden="true" />
      <div className="av-participant-row">
        <span className="av-participant-badge" aria-hidden="true">
          {badge}
        </span>
        <div className="av-participant-body">
          {inputProps.id ? (
            <label className="av-participant-label" htmlFor={inputProps.id}>
              {label}
            </label>
          ) : (
            <span className="av-participant-label">{label}</span>
          )}
          <input
            className="av-participant-input"
            maxLength={24}
            autoComplete="off"
            {...inputProps}
          />
        </div>
      </div>
      {onRemove ? (
        <button
          type="button"
          className="av-participant-remove"
          onClick={onRemove}
          aria-label={removeLabel}
          title={removeLabel}
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="av-participant-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

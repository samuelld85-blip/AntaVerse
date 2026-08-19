import type { CSSProperties } from "react";
import "./participant-setup.css";

export interface AddParticipantButtonProps {
  children: string;
  onClick: () => void;
  disabled?: boolean;
  /** Optional accent used on hover/focus — defaults to the neutral text color. */
  color?: string;
}

export function AddParticipantButton({
  children,
  onClick,
  disabled,
  color,
}: AddParticipantButtonProps) {
  const style = color ? ({ "--av-add-color": color } as CSSProperties) : undefined;
  return (
    <button
      type="button"
      className="av-add-participant"
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      <span aria-hidden="true">+</span> {children}
    </button>
  );
}

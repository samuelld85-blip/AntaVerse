import styles from "./assistant.module.css";

export function CoachAvatar({
  small = false,
  thinking = false,
}: {
  small?: boolean;
  thinking?: boolean;
}) {
  return (
    <span
      className={`${styles.avatar} ${small ? styles.avatarSmall : ""} ${thinking ? styles.avatarThinking : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="23" className={styles.avatarBackdrop} />
        <path d="M8 43c1.8-8 7.3-12 16-12s14.2 4 16 12" className={styles.avatarBody} />
        <path
          d="M15 20c0-7 3.5-11 9-11s9 4 9 11v4c0 5-4 9-9 9s-9-4-9-9v-4Z"
          className={styles.avatarFace}
        />
        <path
          d="M14.5 20c.5-8 4.5-12 10-12 4.5 0 8.5 3.5 9 10-5.2-.2-9-1.8-11.2-4.1-1.5 2.8-4.1 4.5-7.8 6.1Z"
          className={styles.avatarHair}
        />
        <path
          d="M15 19c4.3-.8 7.1-2.5 8.5-5.1 2.6 2.2 5.7 3.5 10 3.8v4H15v-2.7Z"
          className={styles.avatarBand}
        />
        <path d="M20 25h.1m7.8 0h.1" className={styles.avatarDetail} />
        <path d="M22 29c1.3 1 2.7 1 4 0" className={styles.avatarDetail} />
      </svg>
    </span>
  );
}

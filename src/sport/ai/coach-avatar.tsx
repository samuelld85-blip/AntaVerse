import Image from "next/image";
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
      <Image src="/sport/milo-avatar.png" alt="" width={48} height={48} />
    </span>
  );
}

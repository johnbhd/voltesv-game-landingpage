import type { ReactNode } from "react";
import { Arrow } from "./Arrow";
import styles from "./ui.module.css";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  download?: boolean;
};

export function ActionLink({
  href,
  children,
  secondary = false,
  download,
}: ActionLinkProps) {
  return (
    <a
      className={`${styles.action} ${secondary ? styles.secondary : ""}`}
      href={href}
      download={download}
    >
      <span>{children}</span>
      <Arrow />
    </a>
  );
}

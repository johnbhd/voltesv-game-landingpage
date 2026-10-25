import type { ReactNode } from "react";
import { Arrow } from "./Arrow";
import styles from "./ui.module.css";

export function ActionLink({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <a className={`${styles.action} ${secondary ? styles.secondary : ""}`} href={href}><span>{children}</span><Arrow /></a>;
}

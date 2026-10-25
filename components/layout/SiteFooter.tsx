import { Arrow } from "@/components/ui/Arrow";
import styles from "./layout.module.css";

export function SiteFooter() {
  return <footer className={styles.footer}><a href="#top" className={styles.footerBrand}>VOLTES V <span>STRIKE</span></a><p>Unofficial student / fan project.<br /><span>Made with Android Studio & Java.</span></p><a href="#top" className={styles.backTop}>Back to top <Arrow /></a></footer>;
}

import styles from "./reading-progress.module.css";

/** Long pages that get the reading-progress hairline under the header. */
const LONG_PAGES = new Set(["/changelog", "/resume"]);

export function hasReadingProgress(pathname: string): boolean {
  return LONG_PAGES.has(pathname.replace(/\/+$/, "") || "/");
}

/**
 * The reading-progress hairline. Place it inside a positioned bar (the site
 * header mounts it on the pages above); it sits on that bar's bottom edge.
 */
export function ReadingProgress() {
  return <span aria-hidden data-reading-progress className={styles.bar} />;
}

import * as React from "react";
import { LoaderCircle } from "lucide-react";

import styles from "./busy-swap.module.css";

/**
 * A button's content that trades places with a spinner while `busy`, in one
 * grid cell so the button never changes width. The label stays in the tree
 * (hidden from sight only), so the button keeps its name; set `aria-busy` on
 * the button itself.
 */
export function BusySwap({
  busy,
  spinner,
  children,
}: {
  busy: boolean;
  /** Stands in for the label while busy; the default is a spinning ring. */
  spinner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className={styles.root} {...(busy && { "data-busy": "" })}>
      <span className={styles.label}>{children}</span>
      <span aria-hidden className={styles.spinner}>
        {spinner ?? <LoaderCircle />}
      </span>
    </span>
  );
}

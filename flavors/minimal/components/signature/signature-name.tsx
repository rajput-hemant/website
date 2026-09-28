import { cn } from "@/flavors/minimal/lib/utils";

import styles from "./signature.module.css";

/**
 * The generic sign-off where the owner's handwritten signature isn't enabled
 * (`NEXT_PUBLIC_OWNER_BRANDING`): the first name in the wordmark's face,
 * wiped in left to right on the first load like a pen stroke. It takes the
 * signature's box, so swapping one for the other never moves the layout.
 */
export function SignatureName({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const first = name.split(/\s+/).find(Boolean) ?? name;
  return (
    <span className={cn("wordmark", styles.name, className)}>{first}</span>
  );
}

import { DEFAULT_FLAVOR, isLiveFlavor, type LiveFlavorId } from "@/flavors/registry";

/** The edition from `<html data-flavor>`, or the default when missing or unknown. */
export function readFlavorFromDocument(): LiveFlavorId {
  if (typeof document === "undefined") return DEFAULT_FLAVOR;
  const value = document.documentElement.dataset.flavor;
  return isLiveFlavor(value) ? value : DEFAULT_FLAVOR;
}

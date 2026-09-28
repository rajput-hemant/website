/** Nearest ancestor that re-anchors `position: fixed` for descendants. */
export function fixedContainingBlockAncestor(el: Element): Element | null {
  let node = el.parentElement;
  while (node) {
    const style = getComputedStyle(node);
    if (style.transform !== "none") return node;
    if (style.perspective !== "none") return node;
    if (style.filter !== "none") return node;
    if (style.backdropFilter !== "none") return node;

    const contain = style.contain;
    if (
      contain !== "none" &&
      /(?:^|\s)(paint|layout|strict|content)(?:\s|$)/.test(contain)
    ) {
      return node;
    }

    const willChange = style.willChange;
    if (
      willChange !== "auto" &&
      /transform|perspective|filter|paint|layout|strict|content/.test(
        willChange
      )
    ) {
      return node;
    }

    if (node === document.body) break;
    node = node.parentElement;
  }
  return null;
}

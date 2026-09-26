/**
 * Client navigation, except within the current page: there the hash is set
 * directly so `hashchange` fires and the target disclosure opens.
 */
export function navigateTo(href: string, push: (href: string) => void) {
  const url = new URL(href, window.location.href);
  if (url.pathname !== window.location.pathname) {
    push(href);
    return;
  }
  if (!url.hash) return;
  if (url.hash === window.location.hash) {
    document
      .getElementById(decodeURIComponent(url.hash.slice(1)))
      ?.scrollIntoView();
  } else {
    window.location.hash = url.hash;
  }
}

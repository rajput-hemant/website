/** Where a hosted resume lives, for "Also on Google Drive": a known service's name, else the bare host. */
export function hostedResumeLabel(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "the web";
  }
  if (host === "drive.google.com" || host === "docs.google.com") {
    return "Google Drive";
  }
  if (host === "dropbox.com" || host.endsWith(".dropbox.com")) return "Dropbox";
  if (host === "onedrive.live.com" || host === "1drv.ms") return "OneDrive";
  return host;
}

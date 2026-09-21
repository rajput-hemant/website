export { metadata, viewport } from 'next-sanity/studio';

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

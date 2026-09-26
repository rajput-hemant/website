import { getProfile } from "@/lib/data";

// Placeholder home page for Milestone 0. Real UI comes later.
export default async function HomePage() {
  const profile = await getProfile();

  return <h1>{profile.name}</h1>;
}

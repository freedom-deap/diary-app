import { HomeView } from "@/components/home-view";
import { requireAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ManageHome({ searchParams }: { searchParams: Promise<{ q?: string; label?: string }> }) {
  await requireAuthenticatedUser();
  return <HomeView searchParams={searchParams} editable />;
}

import { HomeView } from "@/components/home-view";

export const dynamic = "force-dynamic";

export default function Home({ searchParams }: { searchParams: Promise<{ q?: string; label?: string }> }) {
  return <HomeView searchParams={searchParams} editable={false} />;
}

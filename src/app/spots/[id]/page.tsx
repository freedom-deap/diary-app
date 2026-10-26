import { SpotDetailView } from "@/components/spot-detail-view";

export const dynamic = "force-dynamic";

export default async function SpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SpotDetailView id={id} editable={false} />;
}

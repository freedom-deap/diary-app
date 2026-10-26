import { SpotDetailView } from "@/components/spot-detail-view";
import { requireAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ManageSpotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthenticatedUser();
  const { id } = await params;
  return <SpotDetailView id={id} editable />;
}

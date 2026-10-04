import type { Photo } from "@prisma/client";
import Image from "next/image";
export function PhotoGallery({ photos, deleteAction }: {
  photos: Photo[];
  deleteAction: (photoId: string) => Promise<void>;
}) {
  if (!photos.length) return <p>写真はまだありません。</p>;
  return <div className="photo-gallery">{photos.map((photo) =>
    <figure key={photo.id} className="photo-item">
      <Image src={`/api/photos/${photo.id}`} alt={`${photo.originalName}（登録写真）`} width={photo.width} height={photo.height} unoptimized />
      <figcaption>
        <span>{photo.originalName}</span>
        <form action={deleteAction.bind(null, photo.id)}><button className="text-danger" type="submit">削除</button></form>
      </figcaption>
    </figure>)}</div>;
}

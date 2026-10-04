"use client";

import { useActionState, useRef } from "react";
import type { PhotoUploadState } from "@/app/spots/actions";

export function PhotoUploadForm({ action, remaining }: {
  action: (state: PhotoUploadState, formData: FormData) => Promise<PhotoUploadState>;
  remaining: number;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (previous: PhotoUploadState, formData: FormData) => {
    const result = await action(previous, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, {});

  if (remaining <= 0) return <p className="field-hint">写真は上限の20枚まで登録されています。</p>;
  return <form ref={formRef} action={formAction} className="photo-upload-form">
    <label htmlFor="photos">写真を追加（残り{remaining}枚）</label>
    <input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple required />
    <p className="field-hint">JPEG・PNG・WebP、1枚13MB・1回の合計50MBまで。画像はWebPへ変換されます。</p>
    {state.error ? <p className="form-error multiline" role="alert">{state.error}</p> : null}
    {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
    <button className="button primary compact" type="submit" disabled={pending}>{pending ? "処理中…" : "写真をアップロード"}</button>
  </form>;
}

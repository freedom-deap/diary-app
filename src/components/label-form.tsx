"use client";

import { useActionState } from "react";
import type { LabelActionState } from "@/app/labels/actions";

export function LabelForm({ action, submitLabel, initialName = "", initialColor = "#b4522d" }: {
  action: (state: LabelActionState, formData: FormData) => Promise<LabelActionState>;
  submitLabel: string;
  initialName?: string;
  initialColor?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return <form action={formAction} className="label-form">
    <input name="name" defaultValue={initialName} maxLength={50} aria-label="ラベル名" required />
    <input name="color" type="color" defaultValue={initialColor} aria-label="ラベル色" />
    <button className="button secondary compact" disabled={pending}>{pending ? "保存中…" : submitLabel}</button>
    {state.error ? <p className="field-error" role="alert">{state.error}</p> : null}
    {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
  </form>;
}

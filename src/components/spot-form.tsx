"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { SpotFormState } from "@/app/spots/actions";
import type { SpotFormValues } from "@/lib/spot-validation";
import { LocationPreview } from "./location-preview";
import { PlaceSearch } from "./place-search";

type Props = {
  action: (state: SpotFormState, formData: FormData) => Promise<SpotFormState>;
  initialValues?: SpotFormValues;
  submitLabel: string;
  cancelHref: string;
  labels?: Array<{ id: string; name: string; color: string | null }>;
  initialLabelIds?: string[];
};

const emptyValues: SpotFormValues = { name: "", latitude: "", longitude: "", address: "", description: "", impression: "", visitedAt: "" };

export function SpotForm({ action, initialValues = emptyValues, submitLabel, cancelHref, labels = [], initialLabelIds = [] }: Props) {
  const [state, formAction, pending] = useActionState(action, { errors: {} });
  const values = state.values ?? initialValues;
  const selectedLabelIds = state.selectedLabelIds ?? initialLabelIds;
  return (
    <form action={formAction} className="spot-form" noValidate>
      {state.errors.form ? <p className="form-error" role="alert">{state.errors.form}</p> : null}
      <Field label="スポット名" name="name" error={state.errors.name} required>
        <input id="name" name="name" defaultValue={values.name} maxLength={120} required />
      </Field>
      <PlaceSearch />
      <div className="field-row">
        <Field label="緯度" name="latitude" error={state.errors.latitude} required>
          <input id="latitude" name="latitude" type="number" step="any" min="-90" max="90" defaultValue={values.latitude} required />
        </Field>
        <Field label="経度" name="longitude" error={state.errors.longitude} required>
          <input id="longitude" name="longitude" type="number" step="any" min="-180" max="180" defaultValue={values.longitude} required />
        </Field>
      </div>
      <p className="field-hint">名称検索で候補を選択するか、緯度・経度を直接入力してください。</p>
      <LocationPreview initialLatitude={values.latitude} initialLongitude={values.longitude} />
      <Field label="住所・場所の補足" name="address" error={state.errors.address}>
        <input id="address" name="address" defaultValue={values.address} maxLength={300} />
      </Field>
      <Field label="訪問日" name="visitedAt" error={state.errors.visitedAt}>
        <input id="visitedAt" name="visitedAt" type="date" defaultValue={values.visitedAt} />
      </Field>
      <Field label="スポット情報" name="description" error={state.errors.description}>
        <textarea id="description" name="description" rows={5} defaultValue={values.description} />
      </Field>
      <Field label="自分の感想" name="impression" error={state.errors.impression}>
        <textarea id="impression" name="impression" rows={7} defaultValue={values.impression} />
      </Field>
      <fieldset className="label-picker"><legend>ラベル</legend>
        {labels.map((label) => <label key={label.id}>
          <input name="labelIds" type="checkbox" value={label.id} defaultChecked={selectedLabelIds.includes(label.id)} />
          <span className="label-dot" style={{ backgroundColor: label.color ?? "#b4522d" }} />{label.name}
        </label>)}
        {!labels.length ? <p className="field-hint">ラベルはまだありません。</p> : null}
        <Link className="back-link" href="/labels">ラベルを管理</Link>
      </fieldset>
      <div className="form-actions">
        <button className="button primary" type="submit" disabled={pending}>{pending ? "保存中…" : submitLabel}</button>
        <Link className="button secondary" href={cancelHref}>キャンセル</Link>
      </div>
    </form>
  );
}

function Field({ label, name, error, required, children }: {
  label: string; name: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return <div className="field">
    <label htmlFor={name}>{label}{required ? <span className="required">必須</span> : null}</label>
    {children}
    {error ? <p className="field-error" role="alert">{error}</p> : null}
  </div>;
}

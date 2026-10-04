"use client";

import { useActionState } from "react";
import { login } from "@/app/login/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, {});
  return <form action={action} className="spot-form login-form">
    <input type="hidden" name="next" value={next} />
    <label>ユーザー名<input name="username" autoComplete="username" required /></label>
    <label>パスワード<input name="password" type="password" autoComplete="current-password" required /></label>
    {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
    <button className="button primary" disabled={pending}>{pending ? "確認中…" : "ログイン"}</button>
  </form>;
}

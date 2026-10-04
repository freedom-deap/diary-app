import { logout } from "@/app/login/actions";

export function LogoutForm() {
  return <form action={logout}><button className="button secondary compact" type="submit">ログアウト</button></form>;
}

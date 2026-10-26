import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return <main className="login-page"><header className="page-header"><div><p className="eyebrow">OUTING DIARY</p><h1>ログイン</h1><p className="lead">記録を編集するにはログインしてください。</p></div></header><LoginForm /></main>;
}

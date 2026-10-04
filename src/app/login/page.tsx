import { LoginForm } from "@/components/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/" } = await searchParams;
  return <main className="login-page"><header className="page-header"><div><p className="eyebrow">OUTING DIARY</p><h1>ログイン</h1><p className="lead">個人の記録を閲覧するにはログインしてください。</p></div></header><LoginForm next={next} /></main>;
}

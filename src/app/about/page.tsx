import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "管理者の自己紹介 | おでかけ記録",
  description: "おでかけ記録のサイト管理者について",
};

const profile = {
  name: "くに",
  introduction: "くにの自己紹介と、このサイトについて。",
  about: "最近はラブライブのオタク。旅行にも行く。たまにお菓子も作る。",
  reason: "Codexに9割書かせてます。デザインを勝手に作ってくれるのがかなり助かる。",
};

const links = [
  { label: "X", href: "https://x.com/cp_justice" },
  { label: "note", href: "https://note.com/cp_justice" },
  { label: "制作したページ", href: "https://freedom-deap.github.io/tarrot-app/" },
];

export default function AboutPage() {
  return <main className="narrow-page about-page">
    <Link className="back-link" href="/">← TOPへ戻る</Link>
    <header className="page-header about-header">
      <div>
        <p className="eyebrow">ABOUT THE ADMINISTRATOR</p>
        <h1>このサイトの管理者について</h1>
        <p className="lead">{profile.introduction}</p>
      </div>
    </header>
    <div className="about-grid">
      <section className="detail-card about-identity" aria-labelledby="about-name">
        <span className="about-avatar" aria-hidden="true"><Image className="about-avatar-image" src="/profile-avatar.png" alt="" width={400} height={400} /></span>
        <div><p className="eyebrow">PROFILE</p><h2 id="about-name">{profile.name}</h2><p>サイト管理者</p></div>
      </section>
      <section className="detail-card about-section" aria-labelledby="about-person">
        <p className="eyebrow">01 / ABOUT ME</p><h2 id="about-person">自己紹介</h2><p>{profile.about}</p>
      </section>
      <section className="detail-card about-section" aria-labelledby="about-reason">
        <p className="eyebrow">02 / THIS SITE</p><h2 id="about-reason">このサイトについて</h2><p>{profile.reason}</p>
      </section>
      <section className="detail-card about-section" aria-labelledby="about-links">
        <p className="eyebrow">03 / LINKS</p><h2 id="about-links">リンク</h2>
        <ul className="about-links">{links.map(({ label, href }) =>
          <li key={href}><a className="button secondary" href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a></li>
        )}</ul>
      </section>
      <section id="photo-rights" className="detail-card about-section" aria-labelledby="about-photo-rights">
        <p className="eyebrow">04 / IMAGE RIGHTS</p><h2 id="about-photo-rights">写真・画像について</h2>
        <p>このサイトの投稿写真は、特記のない限り管理者「くに」が撮影しています。写真の無断転載・再配布はご遠慮ください。プロフィール画像は Waifu Labs で作成しました。</p>
      </section>
    </div>
    <div className="about-footer"><Link className="button primary" href="/">スポット一覧を見る</Link></div>
  </main>;
}

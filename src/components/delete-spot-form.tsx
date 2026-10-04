"use client";

export function DeleteSpotForm({ action }: { action: () => Promise<void> }) {
  return <form action={action} onSubmit={(event) => {
    if (!window.confirm("このスポットを削除します。元に戻せません。よろしいですか？")) event.preventDefault();
  }}>
    <button className="button danger" type="submit">削除</button>
  </form>;
}

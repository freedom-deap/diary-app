export function GoogleMapEmbed({ latitude, longitude, apiKey }: { latitude: number; longitude: number; apiKey?: string }) {
  const query = `${latitude},${longitude}`;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  if (!apiKey) return <div className="map-config-notice">
    <p>Google Maps Embed APIキーが未設定のため、埋め込み地図は表示していません。</p>
    <p><code>GOOGLE_MAPS_EMBED_API_KEY</code>を設定すると、この場所にGoogle Mapsを表示できます。</p>
    <a className="button secondary" href={externalUrl} target="_blank" rel="noreferrer">Google Mapsで開く</a>
  </div>;

  const source = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}`;
  return <iframe
    className="google-map-embed"
    title="スポットのGoogle Maps"
    src={source}
    loading="lazy"
    allowFullScreen
    referrerPolicy="strict-origin-when-cross-origin"
  />;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // ドメイン末尾にドットがあるFQDN形式を正規化
  if (url.hostname.endsWith(".")) {
    url.hostname = url.hostname.slice(0, -1);
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}

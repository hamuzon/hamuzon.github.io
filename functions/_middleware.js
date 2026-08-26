export async function onRequest(context) {
  const url = new URL(context.request.url);
  let shouldRedirect = false;

  if (url.hostname.endsWith(".")) {
    url.hostname = url.hostname.slice(0, -1);
    shouldRedirect = true;
  }

  for (const key of Array.from(url.searchParams.keys())) {
    if (key === "_gl" || key.startsWith("_ga")) {
      url.searchParams.delete(key);
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    return Response.redirect(url.toString(), 308);
  }

  return context.next();
}

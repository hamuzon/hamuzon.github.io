export async function onRequest(context) {
  const url = new URL(context.request.url);
  let shouldRedirect = false;

  if (url.hostname.endsWith(".")) {
    url.hostname = url.hostname.slice(0, -1);
    shouldRedirect = true;
  }

  if (url.searchParams.has("_gl")) {
    url.searchParams.delete("_gl");
    shouldRedirect = true;
  }
  if (url.searchParams.has("_ga")) {
    url.searchParams.delete("_ga");
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    return Response.redirect(url.toString(), 308);
  }

  return context.next();
}

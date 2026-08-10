export function parseCookies(cookie: string): Record<string, string> {
  if (!cookie.trim()) return {};

  return cookie
    .trim()
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {} as Record<string, string>);
}

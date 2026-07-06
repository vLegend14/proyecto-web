export function withBase(path: string) {
  const base = import.meta.env.BASE_URL;
  return new URL(path.replace(/^\//, ''), `https://x${base}`).pathname;
}
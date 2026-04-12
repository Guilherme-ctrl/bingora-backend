/** Parses Nest/JWT-style expiresIn like `3600s`, `15m`, `1h` into seconds for API responses. */
export function jwtExpiresInSeconds(expiresIn: string): number {
  const s = expiresIn.trim();
  const m = /^(\d+)(s|m|h|d)?$/i.exec(s);
  if (!m) {
    return 3600;
  }
  const n = Number.parseInt(m[1], 10);
  const u = (m[2] ?? 's').toLowerCase();
  switch (u) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 3600;
    case 'd':
      return n * 86400;
    default:
      return n;
  }
}

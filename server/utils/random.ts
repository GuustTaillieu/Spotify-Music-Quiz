export function randomString(length: number) {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => x.toString(36))
    .join("");
}

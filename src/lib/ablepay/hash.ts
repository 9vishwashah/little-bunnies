import crypto from "crypto";

/**
 * AblePay's hash scheme (their "Appendix 2 - Hash calculation guide"):
 * sort the params by key, pipe-join the non-empty values behind the salt,
 * SHA512, uppercase. Used both to sign outgoing requests and to verify
 * whatever AblePay sends back.
 */
export function ablepayHash(salt: string, params: Record<string, unknown>): string {
  const keys = Object.keys(params).sort();
  let hashData = salt;
  for (const key of keys) {
    const value = params[key];
    if (value === null || value === undefined) continue;
    const str = String(value).trim();
    if (str.length > 0) hashData += "|" + str;
  }
  return crypto.createHash("sha512").update(hashData).digest("hex").toUpperCase();
}

/** Verifies a hash AblePay returned against params it sent (hash field excluded). */
export function verifyAblepayHash(
  salt: string,
  params: Record<string, unknown>,
  receivedHash: string | null | undefined
): boolean {
  if (!receivedHash) return true; // AblePay sends null when hash-checking doesn't apply
  const rest = { ...params };
  delete rest.hash;
  const expected = ablepayHash(salt, rest);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(receivedHash.toUpperCase());
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

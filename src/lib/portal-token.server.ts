import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = () => process.env.PORTAL_SESSION_SECRET || "dev-insecure-secret";

export type PortalPayload = {
  sid: string; // student id
  kind: "parent" | "student";
  exp: number;
};

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

export function signPortalToken(payload: PortalPayload): string {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", SECRET()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyPortalToken(token: string): PortalPayload | null {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = createHmac("sha256", SECRET()).update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PortalPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
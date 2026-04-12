import { decodeJwt } from "jose";
import type { GarzaGlueJWTClaims } from "./auth";

export function decodeJWTPayload(token: string): GarzaGlueJWTClaims | null {
  if (!token.includes(".")) {
    return null;
  }

  try {
    return decodeJwt(token) as unknown as GarzaGlueJWTClaims;
  } catch (error: unknown) {
    return null;
  }
}

export function getOrgInfoFromJWT(token: string): { orgId: string | null } {
  const payload = decodeJWTPayload(token);
  return { orgId: payload?.orgId || null };
}

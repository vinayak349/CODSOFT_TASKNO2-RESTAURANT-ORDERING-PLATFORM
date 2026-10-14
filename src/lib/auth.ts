import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserService, SafeUser } from '@/services/user.service';
import { Role } from '@/lib/db-store';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dinedesk-super-secret-jwt-key-minimum-32-chars-long-2026'
);

const COOKIE_NAME = 'dinedesk_session';
const TOKEN_EXPIRY = '7d';

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  [key: string]: unknown;
}

export async function createSessionToken(user: SafeUser): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    if (!tokenCookie?.value) return null;

    const payload = await verifySessionToken(tokenCookie.value);
    if (!payload?.userId) return null;

    const user = await UserService.findById(payload.userId);
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]): Promise<SafeUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Unauthorized access: Requires one of [${allowedRoles.join(', ')}]`);
  }
  return user;
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;

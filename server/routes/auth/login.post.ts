import { findUserByEmail, isAccountLocked, recordFailedLogin, resetLoginAttempts, activeSessions } from "../../lib/user";
import { serialize, sign } from "../../lib/cookie";
import { verifyPassword } from "../../lib/password";
import { randomUUID } from "node:crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string; rememberMe: boolean }>(event);

  const { email: rawEmail, password, rememberMe } = body;
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: "Email address and password are required",
    });
  }

  const locked = await isAccountLocked(email);
  if (locked) {
    throw createError({
      statusCode: 401,
      message: "Account locked due to too many failed login attempts",
      data: { reason: "locked" },
    });
  }

  const userWithPassword = await findUserByEmail(email);
  if (!userWithPassword) {
    await recordFailedLogin(email);
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
      data: { reason: "bad_credentials" },
    });
  }

  const verified = await verifyPassword(userWithPassword.password, password);
  if (!verified) {
    const result = await recordFailedLogin(email);
    if (result.locked) {
      throw createError({
        statusCode: 401,
        message: "Account locked due to too many failed login attempts",
        data: { reason: "locked" },
      });
    }
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
      data: { reason: "bad_credentials" },
    });
  }

  await resetLoginAttempts(email);

  const config = useRuntimeConfig();

  const sessionId = randomUUID();
  const session = serialize({ userId: userWithPassword.id, sessionId });
  const signedSession = sign(session, config.cookieSecret);

  if (!activeSessions.has(userWithPassword.id)) {
    activeSessions.set(userWithPassword.id, new Set());
  }
  activeSessions.get(userWithPassword.id)!.add(sessionId);

  setCookie(event, config.public.cookieName, signedSession, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: rememberMe
      ? new Date(Date.now() + parseInt(config.cookieRememberMeExpires))
      : new Date(Date.now() + parseInt(config.cookieExpires)),
  });

  setCookie(event, config.public.cookieLoggedInName, "1", {
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: rememberMe
      ? new Date(Date.now() + parseInt(config.cookieRememberMeExpires))
      : new Date(Date.now() + parseInt(config.cookieExpires)),
  });

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return {
    user: userWithoutPassword,
  };
});

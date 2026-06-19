import { c as defineEventHandler, r as readBody, e as createError, j as isAccountLocked, k as findUserByEmail, l as recordFailedLogin, m as resetLoginAttempts, u as useRuntimeConfig, n as serialize, o as sign, p as activeSessions, q as setCookie } from '../../_/nitro.mjs';
import { v as verifyPassword } from '../../_/password.mjs';
import { randomUUID } from 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import '@node-rs/argon2';

const login_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, rememberMe } = body;
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: "Email address and password are required"
    });
  }
  const locked = await isAccountLocked(email);
  if (locked) {
    throw createError({
      statusCode: 401,
      message: "Account locked due to too many failed login attempts",
      data: { reason: "locked" }
    });
  }
  const userWithPassword = await findUserByEmail(email);
  if (!userWithPassword) {
    await recordFailedLogin(email);
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
      data: { reason: "bad_credentials" }
    });
  }
  const verified = await verifyPassword(userWithPassword.password, password);
  if (!verified) {
    const result = await recordFailedLogin(email);
    if (result.locked) {
      throw createError({
        statusCode: 401,
        message: "Account locked due to too many failed login attempts",
        data: { reason: "locked" }
      });
    }
    throw createError({
      statusCode: 401,
      message: "Bad credentials",
      data: { reason: "bad_credentials" }
    });
  }
  await resetLoginAttempts(email);
  const config = useRuntimeConfig();
  const sessionId = randomUUID();
  const session = serialize({ userId: userWithPassword.id, sessionId });
  const signedSession = sign(session, config.cookieSecret);
  if (!activeSessions.has(userWithPassword.id)) {
    activeSessions.set(userWithPassword.id, /* @__PURE__ */ new Set());
  }
  activeSessions.get(userWithPassword.id).add(sessionId);
  setCookie(event, config.public.cookieName, signedSession, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: true,
    expires: rememberMe ? new Date(Date.now() + parseInt(config.cookieRememberMeExpires)) : new Date(Date.now() + parseInt(config.cookieExpires))
  });
  setCookie(event, config.public.cookieLoggedInName, "1", {
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: true,
    expires: rememberMe ? new Date(Date.now() + parseInt(config.cookieRememberMeExpires)) : new Date(Date.now() + parseInt(config.cookieExpires))
  });
  const { password: _password, ...userWithoutPassword } = userWithPassword;
  return {
    user: userWithoutPassword
  };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map

import { c as defineEventHandler, r as readBody, e as createError, k as findUserByEmail, x as createUser, m as resetLoginAttempts, u as useRuntimeConfig, n as serialize, o as sign, p as activeSessions, q as setCookie } from '../../_/nitro.mjs';
import { h as hashPassword } from '../../_/password.mjs';
import { randomUUID } from 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import '@node-rs/argon2';

const signup_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, confirmPassword } = body;
  if (!email || !password || !confirmPassword) {
    throw createError({
      statusCode: 400,
      message: "Email address, password, and confirm password are required"
    });
  }
  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      message: "Passwords do not match"
    });
  }
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: "Email already exists"
    });
  }
  const hashedPassword = await hashPassword(password);
  const newUser = await createUser(email, hashedPassword);
  if (!newUser) {
    throw createError({
      statusCode: 409,
      message: "Email already exists"
    });
  }
  await resetLoginAttempts(email);
  const config = useRuntimeConfig();
  const sessionId = randomUUID();
  const session = serialize({ userId: newUser.id, sessionId });
  const signedSession = sign(session, config.cookieSecret);
  if (!activeSessions.has(newUser.id)) {
    activeSessions.set(newUser.id, /* @__PURE__ */ new Set());
  }
  activeSessions.get(newUser.id).add(sessionId);
  setCookie(event, config.public.cookieName, signedSession, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: true,
    expires: new Date(Date.now() + parseInt(config.cookieExpires))
  });
  setCookie(event, config.public.cookieLoggedInName, "1", {
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: true,
    expires: new Date(Date.now() + parseInt(config.cookieExpires))
  });
  const { password: _password, ...userWithoutPassword } = newUser;
  return {
    user: userWithoutPassword
  };
});

export { signup_post as default };
//# sourceMappingURL=signup.post.mjs.map

import { createUser, findUserByEmail, resetLoginAttempts, activeSessions } from "../../lib/user";
import { serialize, sign } from "../../lib/cookie";
import { hashPassword } from "../../lib/password";
import { randomUUID } from "node:crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string; confirmPassword: string }>(event);

  const { email, password, confirmPassword } = body;
  if (!email || !password || !confirmPassword) {
    throw createError({
      statusCode: 400,
      message: "Email address, password, and confirm password are required",
    });
  }

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      message: "Passwords do not match",
    });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: "Email already exists",
    });
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await createUser(email, hashedPassword);
  if (!newUser) {
    throw createError({
      statusCode: 409,
      message: "Email already exists",
    });
  }

  await resetLoginAttempts(email);

  const config = useRuntimeConfig();

  const sessionId = randomUUID();
  const session = serialize({ userId: newUser.id, sessionId });
  const signedSession = sign(session, config.cookieSecret);

  if (!activeSessions.has(newUser.id)) {
    activeSessions.set(newUser.id, new Set());
  }
  activeSessions.get(newUser.id)!.add(sessionId);

  setCookie(event, config.public.cookieName, signedSession, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + parseInt(config.cookieExpires)),
  });

  setCookie(event, config.public.cookieLoggedInName, "1", {
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + parseInt(config.cookieExpires)),
  });

  const { password: _password, ...userWithoutPassword } = newUser;

  return {
    user: userWithoutPassword,
  };
});

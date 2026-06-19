import type { H3Event } from "h3";
import { findUserById, activeSessions } from "../lib/user";
import { deserialize, unsign } from "../lib/cookie";

export async function getUserFromSession(event: H3Event) {
  const config = useRuntimeConfig(event);

  const cookie = getCookie(event, config.public.cookieName);
  if (!cookie) return null;

  const unsignedSession = unsign(cookie, config.cookieSecret);
  if (!unsignedSession) return null;

  const session = deserialize(unsignedSession);

  const user = await findUserById(session.userId);
  if (!user) {
    return null;
  }

  if (session.sessionId) {
    const userSessions = activeSessions.get(user.id);
    if (!userSessions || !userSessions.has(session.sessionId)) {
      return null;
    }
  }

  return user;
}

export async function getSessionData(event: H3Event) {
  const config = useRuntimeConfig(event);

  const cookie = getCookie(event, config.public.cookieName);
  if (!cookie) return null;

  const unsignedSession = unsign(cookie, config.cookieSecret);
  if (!unsignedSession) return null;

  return deserialize(unsignedSession);
}

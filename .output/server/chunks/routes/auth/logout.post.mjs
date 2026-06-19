import { c as defineEventHandler, u as useRuntimeConfig, v as getSessionData, p as activeSessions, w as deleteCookie } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const logout_post = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const session = await getSessionData(event);
  if (session && session.userId && session.sessionId) {
    const userSessions = activeSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(session.sessionId);
      if (userSessions.size === 0) {
        activeSessions.delete(session.userId);
      }
    }
  }
  deleteCookie(event, config.public.cookieName, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: true
  });
  deleteCookie(event, config.public.cookieLoggedInName, {
    httpOnly: false,
    path: "/",
    sameSite: "strict",
    secure: true
  });
  return {
    user: null
  };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map

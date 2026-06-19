import type { User } from "../lib/user";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const user = await getUserFromSession(event);
  if (user) {
    event.context.user = user;
  } else {
    const loggedInCookie = getCookie(event, config.public.cookieLoggedInName);
    if (loggedInCookie) {
      deleteCookie(event, config.public.cookieLoggedInName, {
        httpOnly: false,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      deleteCookie(event, config.public.cookieName, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      event.context.sessionInvalidated = true;
    }
  }
});

declare module "h3" {
  interface H3EventContext {
    user?: User;
    sessionInvalidated?: boolean;
  }
}

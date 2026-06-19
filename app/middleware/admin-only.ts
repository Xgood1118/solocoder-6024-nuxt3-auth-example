export default defineNuxtRouteMiddleware(async () => {
  const user = useAuthUser();
  const isAdmin = useAdmin();
  const config = useRuntimeConfig();

  if (!user.value) {
    const loggedInCookie = useCookie(config.public.cookieLoggedInName);
    if (loggedInCookie.value) {
      loggedInCookie.value = null;
      const sessionCookie = useCookie(config.public.cookieName);
      sessionCookie.value = null;
      return navigateTo({ name: "login", query: { reason: "account-removed" } });
    }
    return navigateTo({ name: "login" });
  }

  if (!isAdmin.value) return navigateTo({ name: "login" });
});

import { c as defineEventHandler, i as isAdmin, e as createError, h as findAllUsers } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const index_get = defineEventHandler(async (event) => {
  if (!isAdmin(event.context.user)) {
    throw createError({
      statusCode: 401,
      message: "You don't have the rights to access this resource"
    });
  }
  const usersWithPassword = await findAllUsers();
  const usersWithoutPassword = usersWithPassword.map(({ password, ...user }) => user);
  return usersWithoutPassword;
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

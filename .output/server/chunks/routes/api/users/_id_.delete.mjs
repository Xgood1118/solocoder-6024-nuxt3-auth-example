import { c as defineEventHandler, i as isAdmin, e as createError, g as getRouterParam, f as deleteUserById } from '../../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  if (!isAdmin(event.context.user)) {
    throw createError({
      statusCode: 401,
      message: "You don't have the rights to access this resource"
    });
  }
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "User ID is required"
    });
  }
  const currentUser = event.context.user;
  if (currentUser && currentUser.id === id) {
    throw createError({
      statusCode: 400,
      message: "You cannot delete your own account"
    });
  }
  const deleted = await deleteUserById(id);
  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: "User not found"
    });
  }
  return { success: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

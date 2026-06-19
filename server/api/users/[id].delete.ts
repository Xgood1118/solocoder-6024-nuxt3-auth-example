import { deleteUserById, isAdmin } from "../../lib/user";

export default defineEventHandler(async (event) => {
  if (!isAdmin(event.context.user)) {
    throw createError({
      statusCode: 401,
      message: "You don't have the rights to access this resource",
    });
  }

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  const currentUser = event.context.user;
  if (currentUser && currentUser.id === id) {
    throw createError({
      statusCode: 400,
      message: "You cannot delete your own account",
    });
  }

  const deleted = await deleteUserById(id);
  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: "User not found",
    });
  }

  return { success: true };
});

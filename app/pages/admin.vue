<script lang="ts" setup>
import { FetchError } from "ofetch";

definePageMeta({
  middleware: ["admin-only"],
});

const { data: users, refresh } = await useFetch("/api/users");

const currentUser = useAuthUser();

const deleting = ref<string | null>(null);

async function onDeleteUser(userId: string) {
  if (currentUser.value?.id === userId) {
    return;
  }

  if (!confirm("Are you sure you want to delete this user?")) {
    return;
  }

  try {
    deleting.value = userId;
    await $fetch(`/api/users/${userId}`, {
      method: "DELETE",
    });
    await refresh();
  } catch (error) {
    console.error(error);
    if (error instanceof FetchError) {
      alert(error.data.message || "Failed to delete user");
    }
  } finally {
    deleting.value = null;
  }
}
</script>

<template>
  <div>
    <PageTitle title="Admin page" />
    <PageDescription description="This page should only be visible if user is connected and has admin role" />
    <PageUser :user="currentUser" />
    <div class="mb-3 text-light-100">
      <div class="table w-full">
        <div class="table-header-group font-bold">
          <div class="table-row">
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Roles</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </div>
        </div>
        <div v-if="users" class="table-row-group">
          <div v-for="user in users" :key="user.id" class="table-row">
            <TableBodyCell>{{ user.id }}</TableBodyCell>
            <TableBodyCell>{{ user.email }}</TableBodyCell>
            <TableBodyCell>{{ user.roles.join(", ") }}</TableBodyCell>
            <TableBodyCell>
              <button
                v-if="currentUser?.id !== user.id"
                :disabled="deleting === user.id"
                class="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 focus:outline-none focus:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="onDeleteUser(user.id)"
              >
                {{ deleting === user.id ? "Deleting..." : "Delete" }}
              </button>
              <span v-else class="text-xs text-slate-500">Yourself</span>
            </TableBodyCell>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

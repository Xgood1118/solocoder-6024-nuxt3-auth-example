<script lang="ts" setup>
import { FetchError } from "ofetch";

definePageMeta({
  middleware: ["guest-only"],
  layout: false,
});

const { signup } = useAuth();

const form = reactive({
  data: {
    email: "",
    password: "",
    confirmPassword: "",
  },
  error: "",
  pending: false,
});

async function onSignupClick() {
  try {
    form.error = "";
    form.pending = true;

    await signup(form.data.email, form.data.password, form.data.confirmPassword);

    await navigateTo("/private");
  } catch (error) {
    console.error(error);
    if (!(error instanceof FetchError)) {
      throw error;
    }

    form.error = error.data.message;
  } finally {
    form.pending = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <h1 class="my-24 font-bold text-2xl text-center">Create your account</h1>
    </header>
    <main class="mx-auto max-w-sm w-full">
      <form class="mb-6 p-12 bg-slate-900 rounded shadow" @submit.prevent="onSignupClick">
        <p
          v-if="form.error"
          class="mb-3 px-3 py-1.5 w-full border rounded border-red-400 text-sm text-center text-red-400"
        >
          {{ form.error }}
        </p>
        <div class="mb-3">
          <label for="email" class="mb-1 inline-block font-semibold text-sm text-slate-200">Email address</label>
          <input
            id="email"
            v-model="form.data.email"
            type="email"
            class="px-3 py-1.5 w-full border rounded border-slate-700 bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            required
          >
        </div>
        <div class="mb-3">
          <label for="password" class="mb-1 inline-block font-semibold text-sm text-slate-200">Password</label>
          <input
            id="password"
            v-model="form.data.password"
            type="password"
            class="px-3 py-1.5 w-full border rounded border-slate-700 bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            required
          >
        </div>
        <div class="mb-3">
          <label for="confirm-password" class="mb-1 inline-block font-semibold text-sm text-slate-200">Confirm password</label>
          <input
            id="confirm-password"
            v-model="form.data.confirmPassword"
            type="password"
            class="px-3 py-1.5 w-full border rounded border-slate-700 bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            required
          >
        </div>
        <div>
          <button
            type="submit"
            :disabled="form.pending"
            class="px-3 py-1.5 w-full rounded bg-light-100 font-semibold text-sm text-slate-950 hover:bg-light-700 focus:outline-none focus:bg-light-700 transition-colors"
          >
            Sign up
          </button>
        </div>
      </form>
      <div class="mb-6 text-center">
        <NuxtLink to="/login" class="text-xs text-slate-400 transition-colors hover:text-light-100">Already have an account? Sign in</NuxtLink>
      </div>
      <div class="text-center">
        <NuxtLink to="/" class="text-xs text-slate-400 transition-colors hover:text-light-100">Go back home</NuxtLink>
      </div>
    </main>
    <BaseFooter class="mt-auto" />
  </div>
</template>

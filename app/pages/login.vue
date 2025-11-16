<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { loginSchema, type LoginSchema } from '~~/shared/schemas'

const router = useRouter()
const toast = useToast()

const state = reactive({
  cookie: '',
})

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
  try {
    await $fetch('/api/login', { method: 'POST', body: event.data })
  } catch (e) {
    toast.add({
      color: 'error',
      title: 'Failed to log in',
      description: 'Please check your cookie and try again',
    })
  }
  router.push('/armory')
}
</script>

<template>
  <UContainer>
    <h1 class="text-4xl font-semibold mb-4">
      Sign in to <span class="text-primary">Fortify</span>
    </h1>
    <p class="mb-4">
      This website needs your Siege session token to perform actions on your
      behalf. Please sign in to
      <ULink
        class="text-primary"
        external
        href="https://siege.hackclub.com"
        target="_blank"
        >Siege</ULink
      >
      and enter the value of the <code>_siege_session</code> cookie below to
      sign in.
    </p>

    <UForm
      :schema="loginSchema"
      :state="state"
      class="space-y-2"
      @submit="onSubmit"
    >
      <UFormField label="Cookie" name="cookie">
        <UInput type="password" autocomplete="off" v-model="state.cookie" />
      </UFormField>

      <UButton type="submit">Sign in</UButton>
    </UForm>
  </UContainer>
</template>

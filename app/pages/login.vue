<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { loginSchema, type LoginSchema } from '~~/shared/schemas'

const router = useRouter()

const state = reactive({
  cookie: '',
})

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
  await $fetch('/api/login', { method: 'POST', body: event.data })
  router.push('/armory')
}
</script>

<template>
  <UContainer>
    <h1 class="text-4xl font-semibold mb-4">
      Sign in to <span class="text-primary">Fortify</span>
    </h1>
    <p class="mb-4">
      Please sign in to
      <a href="https://siege.hackclub.com" target="_blank">Siege</a> and enter
      the value of the <code>_siege_session</code> cookie below to sign in.
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

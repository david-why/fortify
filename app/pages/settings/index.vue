<script setup lang="ts">
const HIDE_JUMPSCARES_KEY = 'fortify-hide-jumpscares'

const settings = useFortifySettings()

watch(settings, (value) => {
  localStorage.setItem(
    HIDE_JUMPSCARES_KEY,
    JSON.stringify(value.hideJumpscares)
  )
})

onMounted(() => {
  if (import.meta.client) {
    settings.hideJumpscares = JSON.parse(
      localStorage.getItem(HIDE_JUMPSCARES_KEY) || 'false'
    )
  }
})
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Settings</h1>
  <p class="mb-4">Here you can adjust some Fortify-specific settings.</p>
  <UCheckbox
    v-model="settings.hideJumpscares"
    label="Hide jumpscares"
    description="Disable jumpscares, such as the blood-colored screen and the image when you click Edit Project."
  />
</template>

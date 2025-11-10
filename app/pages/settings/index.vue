<script setup lang="ts">
const settings = useFortifySettings()
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Settings</h1>
  <p class="mb-4">Here you can adjust some Fortify-specific settings.</p>
  <UCheckbox
    v-model="settings.hideJumpscares"
    label="Hide jumpscares"
    description="Disable jumpscares, such as the blood-colored screen and the image when you click Edit Project."
  />
  <UCheckbox
    v-model="settings.showStonemason"
    label="Show stonemason review page"
    description="Show the Stonemason page on the navigation bar. This is only useful if you are actually a stonemason."
  />
  <UCheckbox
    v-model="settings.showReview"
    label="Show final review page"
    description="Show the Review page on the navigation bar. This is only useful if you are a final reviewer."
  />
</template>

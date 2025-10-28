<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Keep',
    to: '/',
    active: route.path === '/',
  },
])
</script>

<template>
  <UContainer>
    <UHeader class="mb-4">
      <template #title>
        <span class="text-primary">Fortify</span>
      </template>

      <UNavigationMenu :items="navItems" />
    </UHeader>

    <UMain>
      <slot />
    </UMain>
  </UContainer>
</template>

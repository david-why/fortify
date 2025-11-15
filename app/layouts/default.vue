<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const settings = useFortifySettings()

const navItems = computed<NavigationMenuItem[]>(() => {
  const items = [
    {
      label: 'Space',
      to: '/keep',
      icon: 'i-material-symbols-rocket-launch',
    },
    {
      label: 'Armory',
      to: '/armory',
      icon: 'i-material-symbols-swords',
    },
    {
      label: 'Great Hall',
      to: '/great-hall',
      icon: 'i-material-symbols-account-balance',
    },
    {
      label: 'Market',
      to: '/market',
      icon: 'i-material-symbols-shopping-bag',
    },
  ]
  if (settings.value.showStonemason) {
    items.push({
      label: 'Stonemason',
      to: '/review',
      icon: 'i-material-symbols-castle',
    })
  }
  items.push({
    label: 'Settings',
    to: '/settings',
    icon: 'i-material-symbols-settings',
  })
  return items
})
</script>

<template>
  <UHeader class="mb-4">
    <template #title>
      <span class="text-primary">Fortify</span>
    </template>

    <UNavigationMenu :items="navItems" />

    <template #body>
      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>

  <UMain>
    <UContainer>
      <slot />
    </UContainer>
  </UMain>
</template>

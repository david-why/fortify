<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const navItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/',
    icon: 'i-material-symbols-home-outline',
    active: route.path === '/',
  },
  {
    label: 'Armory',
    to: '/armory',
    icon: 'i-material-symbols-swords',
    active: route.path === '/armory',
  },
  {
    label: 'Great Hall',
    to: '/great-hall',
    icon: 'i-material-symbols-account-balance',
    active: route.path === '/great-hall',
  },
  {
    label: 'Market',
    to: '/market',
    icon: 'i-material-symbols-shopping-bag',
    active: route.path === '/market',
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: 'i-material-symbols-settings',
    active: route.path === '/settings',
  },
])
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

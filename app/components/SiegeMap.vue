<script setup lang="ts">
const router = useRouter()

const layers = computed(() => [
  { image: '/images/castle/0-sky.webp' },
  { image: '/images/castle/1-mountains.webp' },
  { image: '/images/castle/2-grass.webp' },
  { image: '/images/castle/3-walls.webp' },
  { image: '/images/castle/4-chambers.webp' },
  { image: '/images/castle/5-keep.webp' },
  { image: '/images/castle/6-great-hall.webp' },
  { image: '/images/castle/7-armory.webp' },
  { image: '/images/castle/8-market.webp' },
  { image: '/images/castle/9-fountain.webp' },
  { image: '/images/castle/10-catacombs.webp' },
  { image: '/images/castle/11-foreground.webp' },
  { image: '/images/castle/12-lighting.webp' },
  { image: '/images/castle/logo.webp' },
])

function onSectionClicked(
  name:
    | 'chambers'
    | 'keep'
    | 'great-hall'
    | 'armory'
    | 'market'
    | 'map'
    | 'catacombs'
) {
  switch (name) {
    case 'armory':
      return router.push('/armory')
    default:
      return router.push('/dev')
  }
}
</script>

<template>
  <div class="relative">
    <div class="absolute inset-0" v-for="layer in layers" :key="layer.image">
      <img :src="layer.image" />
    </div>
    <div class="absolute inset-0">
      <SiegeClickOverlay @click="onSectionClicked" />
    </div>
  </div>
</template>

<style scoped></style>

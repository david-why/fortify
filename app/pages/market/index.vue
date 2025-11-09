<script setup lang="ts">
const toast = useToast()
const loadingIndicator = useLoadingIndicator()

const { data, error, status, refresh } = await useFetch('/api/shop')
if (error.value) {
  toast.add({
    color: 'error',
    title: 'Failed to get shop data',
    description: error.value.message,
  })
  throw navigateTo('/')
}

const shopDisabled = ref(false)

const shop = ref(data.value!)
watch(data, (value) => {
  if (value && status.value === 'success') {
    shop.value = value
  }
})

const displayItems = computed(() =>
  shop.value.items.filter(
    (item) => item.purchased < (item.stock ?? Number.MAX_VALUE)
  )
)

async function onPurchaseItem(name: string) {
  if (confirm(`Are you sure you want to buy ${name}?`)) {
    try {
      loadingIndicator.start()
      shopDisabled.value = true
      await $fetch(`/api/users/me/purchases`, {
        method: 'POST',
        body: { item_name: name },
      })
      await refresh()
    } catch (e) {
      toast.add({
        color: 'error',
        title: 'Failed to purchase item',
        description: String(e),
      })
    } finally {
      shopDisabled.value = false
      loadingIndicator.finish()
    }
  }
}

// loadingIndicator will be set when this is called
async function onTreeUpdated() {
  try {
    shopDisabled.value = true
    await refresh()
    shopDisabled.value = false
  } finally {
    loadingIndicator.finish()
  }
}
</script>

<template>
  <h1 class="text-3xl font-bold mb-4">Market</h1>

  <p class="mb-4 flex items-center">
    Current&nbsp; <CoinIcon />: {{ shop.coins }}
  </p>

  <HDivider />

  <h2 class="text-2xl font-bold mb-4">Device upgrades</h2>

  <div class="mb-4">
    <TechTree
      :tree="shop.tech_tree"
      :disabled="shopDisabled"
      :supported-region="shop.is_region_supported"
      :user-device="shop.user_device"
      @update="onTreeUpdated"
      @purchase="onPurchaseItem"
    />
  </div>

  <HDivider />

  <h2 class="text-2xl font-bold mb-4">Other stuff</h2>

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    <UCard v-for="item in displayItems" :key="item.id">
      <h3 class="text-xl font-semibold mb-2">{{ item.name }}</h3>
      <p class="mb-2 flex items-center gap-1"><CoinIcon /> {{ item.cost }}</p>
      <p class="mb-2">{{ item.description }}</p>
      <p class="text-sm mb-2" v-if="item.stock">
        Purchased: {{ item.purchased }} / {{ item.stock }}
      </p>
      <p class="text-sm mb-2" v-else-if="item.purchased">
        Purchased: {{ item.purchased }}
      </p>
      <div>
        <UButton
          variant="subtle"
          @click="onPurchaseItem(item.name)"
          :disabled="shopDisabled || shop.coins < item.cost"
          >Buy!</UButton
        >
      </div>
    </UCard>
  </div>
</template>

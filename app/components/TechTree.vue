<script setup lang="ts">
const loadingIndicator = useLoadingIndicator()
const toast = useToast()

const {
  tree: techTree,
  supportedRegion,
  userDevice,
  disabled: globalDisabled = false,
} = defineProps<{
  tree: SiegeTechTree
  supportedRegion: boolean
  userDevice: SiegeUserDevice
  disabled?: boolean
}>()

const emit = defineEmits<{
  update: []
  purchase: [name: string]
}>()

const DEVICE_TYPE_NAMES: Record<string, string> = {
  laptop: 'Laptop',
  laptop_grant: 'Laptop grant',
  tablet: 'Tablet',
}

const deviceTrees = computed(() => {
  return [supportedRegion ? techTree.laptop : techTree.laptop_grant].concat([
    techTree.tablet,
  ])
})
const deviceTypeOptions = computed(() => {
  return deviceTrees.value.flatMap((tree) => {
    if (!tree.initialNode.options) {
      return [
        {
          value: tree.initialNode.id,
          label: DEVICE_TYPE_NAMES[tree.type],
        },
      ]
    }
    return tree.initialNode.options.map((opt) => ({
      value: opt.id,
      label: `${DEVICE_TYPE_NAMES[tree.type]} - ${opt.title}`,
    }))
  })
})
const chosenDeviceBranch = computed(() => {
  if (!chosenDevice.value) return []
  for (const tree of Object.values(techTree) as SiegeTreeBase[]) {
    if (
      tree.initialNode.id === chosenDevice.value ||
      tree.initialNode.options?.find((opt) => opt.id === chosenDevice.value)
    ) {
      return Object.values(tree.branches[chosenDevice.value]!)
    }
  }
  console.warn('Cannot find branch', chosenDevice.value)
  return []
})
const deviceUpgradeOptions = computed(() => {
  const purchasedItems = chosenDeviceBranch.value
    .filter((item) => item.purchased)
    .map((item) => item.title)
  return chosenDeviceBranch.value.map((item) => {
    const requires = item.requires?.split(',') ?? []
    const unsatisfiedReqs = requires.filter(
      (item) => !purchasedItems.includes(item)
    )
    const maxPurchases =
      item.maxPurchases === null ? null : item.maxPurchases ?? 1
    const currentPurchases = item.currentPurchases ?? (item.purchased ? 1 : 0)
    const disabled = !!(
      unsatisfiedReqs.length ||
      (maxPurchases && (item.currentPurchases || 0) >= maxPurchases)
    )
    const limitText = maxPurchases
      ? `${currentPurchases}/${maxPurchases}`
      : `${currentPurchases}`
    const reqText = unsatisfiedReqs.length
      ? `Requires ${unsatisfiedReqs.join(' & ')}`
      : ''
    return {
      title: item.title,
      cost: item.price,
      description: item.description,
      qtyText: limitText,
      reqText,
      disabled,
    }
  })
})
const currentGrant = computed(() => {
  if (chosenDevice.value !== 'laptop_grant_base') {
    return 0
  }
  let grant = 650
  for (const item of Object.values(
    techTree.laptop_grant.branches.laptop_grant_base!
  )) {
    const perItem =
      {
        '+$10 Grant': 10,
        '+$50 Grant': 50,
        '+$100 Grant': 100,
      }[item.title] ?? 0
    if (item.currentPurchases) {
      grant += perItem * item.currentPurchases
    }
  }
  return grant
})

const treeDisabled = ref(false)

const chosenDevice = ref(
  userDevice.has_main_device ? userDevice.main_device : undefined
)

async function onChangeDevice(device: string) {
  try {
    treeDisabled.value = true
    loadingIndicator.start()
    await $fetch(`/api/shop/device`, {
      method: 'POST',
      body: { device_id: device },
    })
    treeDisabled.value = false
    emit('update')
  } catch (e) {
    loadingIndicator.finish({ error: true })
    toast.add({
      color: 'error',
      title: 'Failed to switch device',
      description: String(e),
    })
  }
}

async function purchaseUpgrade(name: string) {
  emit('purchase', name)
}

watch(chosenDevice, (value) => value && onChangeDevice(value))
</script>

<template>
  <URadioGroup
    class="mb-4"
    v-model="chosenDevice"
    :items="deviceTypeOptions"
    :disabled="treeDisabled || globalDisabled"
  />
  <p class="mb-4" v-if="chosenDevice === 'laptop_grant_base'">
    Current grant: ${{ currentGrant }}
  </p>
  <div
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    <UCard v-for="card in deviceUpgradeOptions">
      <h2 class="text-xl font-semibold mb-2">
        {{ card.title }} ({{ card.qtyText }})
      </h2>
      <p class="mb-2"><CoinIcon /> {{ card.cost }}</p>
      <p class="mb-4">{{ card.description }}</p>
      <div class="flex items-center gap-2">
        <UButton
          :color="card.disabled ? 'neutral' : 'primary'"
          variant="subtle"
          @click="purchaseUpgrade(card.title)"
          :disabled="treeDisabled || globalDisabled || card.disabled"
          >Buy!</UButton
        >
        <span class="text-sm text-warning" v-if="card.reqText">{{
          card.reqText
        }}</span>
      </div>
    </UCard>
  </div>
</template>

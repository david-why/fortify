<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'
import type { TreeItemSelectEvent } from 'reka-ui'

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
}>()

const treeDisabled = ref(false)
const treeSelected = ref<CustomTreeItem[]>([])

const deviceTypeNames: Record<string, string> = {
  laptop: 'Laptop',
  laptop_grant: 'Laptop grant',
  tablet: 'Tablet',
}

interface CustomTreeItem extends TreeItem {
  id?: string
  children?: CustomTreeItem[]
  description?: string
}
const displayTree = computed<CustomTreeItem[]>(() => {
  const options = [
    supportedRegion ? techTree.laptop : techTree.laptop_grant,
  ].concat([techTree.tablet])
  return options.map((tree) => {
    let children: CustomTreeItem[]
    let id: string | undefined = undefined
    if (tree.initialNode.options) {
      children = tree.initialNode.options.map((opt) => ({
        id: `main-${opt.id}`,
        label: opt.title,
        defaultExpanded: true,
        children:
          opt.id === userDevice.main_device
            ? getNodeChildren(tree, opt.id)
            : undefined,
      }))
    } else {
      children =
        tree.initialNode.id === userDevice.main_device
          ? getNodeChildren(tree, tree.initialNode.id)
          : []
      id = `main-${tree.initialNode.id}`
    }
    return {
      id,
      label: deviceTypeNames[tree.type],
      disabled: !!tree.initialNode.options,
      defaultExpanded: true,
      children,
    }
  })
})

// given a tree and main device id, get the children in a tree format
// i hate algorithms (this isn't even hard lol)
// but have fun reading this function :)))
function getNodeChildren(base: SiegeTreeBase, mainID: string) {
  const branchMap = base.branches[mainID]!
  const rootNodes: CustomTreeItem[] = []
  const allNodes: CustomTreeItem[] = []
  const pendingItems: SiegeTreeNode[] = Object.values(branchMap)
  const nextRoundItems: SiegeTreeNode[] = []
  while (pendingItems.length) {
    const startLength = pendingItems.length
    for (const upgradeItem of pendingItems) {
      let array = rootNodes
      if (upgradeItem.requires) {
        const maybeParent = allNodes.find(
          (item) => item.label === upgradeItem.requires
        )
        if (!maybeParent) {
          nextRoundItems.push(upgradeItem)
          continue
        }
        if (!maybeParent.children) {
          maybeParent.children = []
        }
        array = maybeParent.children
      }
      let description = upgradeItem.description
      if (upgradeItem.maxPurchases) {
        description += `\nPurchased: ${upgradeItem.currentPurchases ?? 0}/${
          upgradeItem.maxPurchases
        }`
      }
      const node = {
        id: `upgrade-${upgradeItem.title}`,
        label: upgradeItem.title,
        description: description,
        disabled:
          (upgradeItem.currentPurchases ?? 0) >=
          (upgradeItem.maxPurchases ?? Number.MAX_VALUE),
        defaultExpanded: true,
        children: [],
      }
      array.push(node)
      allNodes.push(node)
    }
    if (nextRoundItems.length === startLength) {
      console.warn(
        'Made no progress this round, the following items are orphans',
        nextRoundItems
      )
      break
    }
    pendingItems.splice(0, pendingItems.length, ...nextRoundItems)
    nextRoundItems.length = 0
  }
  return rootNodes
}

async function onSelect(event: TreeItemSelectEvent<CustomTreeItem>) {
  const item = event.detail.value
  if (!item || !item.id) {
    event.preventDefault()
    return
  }
  const id = item.id
  const selected = !event.detail.isSelected
  if (id.startsWith('main-')) {
    if (!selected) {
      // cannot deselect main devices
      event.preventDefault()
      return
    }
    // typescript really hates me :(
    const indicesToRemove: number[] = []
    for (const [idx, val] of treeSelected.value.entries()) {
      if (val.id?.startsWith('main-') && val.id !== id) {
        indicesToRemove.push(idx)
      }
    }
    for (const idx of indicesToRemove.reverse()) {
      treeSelected.value.splice(idx, 1)
    }
    try {
      treeDisabled.value = true
      loadingIndicator.start()
      await $fetch(`/api/shop/device`, {
        method: 'POST',
        body: { device_id: id.substring(5) },
      })
      emit('update')
      treeDisabled.value = false
    } catch (e) {
      loadingIndicator.finish({ error: true })
      toast.add({
        color: 'error',
        title: 'Failed to save main device',
        description: String(e),
      })
    }
  } else if (id.startsWith('upgrade-')) {
    event.preventDefault()
  }
}

// find a tree item from id
function findItem(id: string) {
  function findFromList(list: CustomTreeItem[]): CustomTreeItem | undefined {
    for (const item of list) {
      if (item.id === id) {
        return item
      }
    }
    for (const item of list) {
      if (item.children) {
        const res = findFromList(item.children)
        if (res) {
          return res
        }
      }
    }
  }
  return findFromList(displayTree.value)
}

onMounted(() => {
  if (userDevice.has_main_device) {
    const item = findItem(`main-${userDevice.main_device}`)
    if (item) {
      treeSelected.value.push(item)
    }
  }
})
</script>

<template>
  <UTree
    v-model="treeSelected"
    :disabled="treeDisabled || globalDisabled"
    :items="displayTree"
    @select="onSelect"
    @toggle.prevent
    :multiple="true"
  >
    <template
      #item-leading="{
        item: { id, disabled },
        selected,
        indeterminate,
        handleSelect,
      }"
    >
      <UCheckbox
        :model-value="indeterminate ? 'indeterminate' : selected"
        @change="handleSelect"
        :disabled="disabled"
        @click.stop
        v-if="id?.startsWith('main-')"
      />
      <span v-else></span>
    </template>
    <template #item-label="{ item: { label, description } }">
      <span class="text-left block">{{ label }}</span>
      <span class="text-left block text-muted" v-if="description">{{
        description
      }}</span>
    </template>
  </UTree>
</template>

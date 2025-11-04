<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'
import type { TreeItemSelectEvent } from 'reka-ui'

const loadingIndicator = useLoadingIndicator()
const toast = useToast()

const { tree: techTree, disabled: globalDisabled = false } = defineProps<{
  tree: SiegeTechTree
  disabled?: boolean
}>()

const emit = defineEmits<{
  update: []
}>()

const treeDisabled = ref(false)
const treeSelected = ref([])

const deviceTypeNames: Record<string, string> = {
  laptop: 'Laptop',
  laptop_grant: 'Laptop grant',
  tablet: 'Tablet',
}

interface CustomTreeItem extends TreeItem {
  id?: string
  children?: CustomTreeItem[]
}
const displayTree = computed<CustomTreeItem[]>(() => {
  return [techTree.laptop, techTree.laptop_grant, techTree.tablet].map(
    (tree) => {
      let children: CustomTreeItem[]
      let id: string | undefined = undefined
      if (tree.initialNode.options) {
        children = tree.initialNode.options.map((opt) => ({
          id: `main-${opt.id}`,
          label: opt.title,
        }))
      } else {
        children = []
        id = `main-${tree.initialNode.id}`
      }
      return {
        id,
        label: deviceTypeNames[tree.type],
        disabled: !!tree.initialNode.options,
        defaultExpanded: true,
        children,
      }
    }
  )
})

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
    try {
      treeDisabled.value = true
      loadingIndicator.start()
      await $fetch(`/api/shop/device`, {
        method: 'POST',
        body: { device_id: id.substring(5) },
      })
      loadingIndicator.finish()
    } catch (e) {
      loadingIndicator.finish({ error: true })
      toast.add({
        color: 'error',
        title: 'Failed to save main device',
        description: String(e),
      })
    } finally {
      treeDisabled.value = false
      emit('update')
    }
  }
}
</script>

<template>
  <UTree
    v-model="treeSelected"
    :disabled="treeDisabled || globalDisabled"
    :items="displayTree"
    @select="onSelect"
    :multiple="true"
  >
    <template
      #item-leading="{
        item: { disabled },
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
      />
    </template>
  </UTree>
</template>

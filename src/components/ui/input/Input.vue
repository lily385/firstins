<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

defineProps<{
  class?: HTMLAttributes['class']
  type?: string
}>()
</script>

<template>
  <input
    data-slot="input"
    :type="type ?? 'text'"
    v-bind="$attrs"
    :class="cn(
      'border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive flex w-full min-w-0 rounded-lg border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
      $props.class
    )"
  />
</template>

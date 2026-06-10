<script setup lang="ts">
import { Check } from '@lucide/vue'

interface Step {
  label: string
}

defineProps<{
  steps: Step[]
  current: number // 1-based
}>()
</script>

<template>
  <div class="flex items-start justify-center py-8 px-4">
    <template v-for="(step, idx) in steps" :key="idx">
      <!-- Step -->
      <div class="flex flex-col items-center gap-2">
        <!-- Circle -->
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors"
          :class="idx + 1 <= current
            ? 'bg-cyan-900 text-white'
            : 'border-2 border-gray-300 text-gray-400 bg-white'"
        >
          <Check v-if="idx + 1 < current" class="w-4 h-4" />
          <span v-else>{{ idx + 1 }}</span>
        </div>
        <!-- Label -->
        <span
          class="text-xs text-center leading-tight whitespace-nowrap"
          :class="{
            'text-cyan-900 font-semibold': idx + 1 === current,
            'text-gray-500': idx + 1 < current,
            'text-gray-400': idx + 1 > current,
          }"
        >{{ step.label }}</span>
      </div>
      <!-- Connector line -->
      <div
        v-if="idx < steps.length - 1"
        class="w-16 shrink-0 h-px mt-[1.125rem] mx-2"
        :class="idx + 1 < current ? 'bg-cyan-900' : 'bg-gray-300'"
      />
    </template>
  </div>
</template>

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
  <div class="flex items-start justify-center py-4 sm:py-6 px-4">
    <template v-for="(step, idx) in steps" :key="idx">
      <!-- Step -->
      <div class="flex flex-col items-center gap-1 sm:gap-1.5 w-16 sm:w-auto">
        <!-- Circle -->
        <div
          class="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0 transition-colors"
          :class="idx + 1 <= current
            ? 'bg-cyan-900 text-white'
            : 'border-2 border-gray-300 text-gray-400 bg-white'"
        >
          <Check v-if="idx + 1 < current" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span v-else>{{ idx + 1 }}</span>
        </div>
        <!-- Label -->
        <span
          class="text-xs sm:text-sm text-center leading-tight sm:whitespace-nowrap"
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
        class="w-4 sm:w-12 shrink-0 h-px mt-3 sm:mt-[1rem] mx-0.5 sm:mx-1.5"
        :class="idx + 1 < current ? 'bg-cyan-900' : 'bg-gray-300'"
      />
    </template>
  </div>
</template>

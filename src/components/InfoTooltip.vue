<script setup lang="ts">
import { Info } from '@lucide/vue'
defineProps<{ text?: string }>()
</script>

<template>
	<span v-if="text" class="relative group inline-flex items-center cursor-help ml-0.5 align-middle">
		<Info class="w-3.5 h-3.5 text-gray-400" />
		<span
			class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs text-white bg-gray-700 rounded shadow-lg
			       opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-20
			       w-max max-w-[220px] whitespace-normal leading-relaxed"
		>{{ text }}</span>
	</span>
</template>

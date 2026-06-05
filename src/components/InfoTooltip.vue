<template>
	<span v-if="text" class="relative group inline-flex items-center cursor-help ml-0.5 align-middle">
		<span
			class="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[10px] leading-none select-none"
		>i</span>
		<span
			class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs text-white bg-gray-700 rounded shadow-lg
			       opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-20
			       w-max max-w-[220px] whitespace-normal leading-relaxed"
		>{{ text }}</span>
	</span>
</template>

<script setup lang="ts">
defineProps<{ text?: string }>()
</script>

<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), { message: '試算中，請稍候…' })
</script>

<template>
	<Teleport to="body">
		<div class="fixed inset-0 z-[65] flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm">
			<div class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-cyan-900 animate-spin" />
			<p class="mt-4 text-sm text-cyan-900 font-semibold tracking-wide">{{ message }}</p>
		</div>
	</Teleport>
</template>

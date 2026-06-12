<template>
	<Teleport to="body">
		<div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm">
			<div class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-cyan-900 animate-spin" />
			<p class="mt-4 text-sm text-cyan-900 font-semibold tracking-wide">試算中，請稍候…</p>
		</div>
	</Teleport>
</template>

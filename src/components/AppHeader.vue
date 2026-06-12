<script setup lang="ts">
import { ref } from 'vue'
import { Menu, X, ChevronRight } from '@lucide/vue'

const menuOpen = ref(false)

const navLinks = [
	{ label: '個人保險', active: false },
	{ label: '線上投保', active: true },
	{ label: '保戶服務', active: false },
	{ label: '最新消息', active: false },
	{ label: '產品概覽', active: false },
	{ label: '會員中心', active: false },
]
</script>

<template>
	<!-- header 提升至 z-[60]，確保壓在 overlay 之上 -->
	<header class="bg-white sticky top-0 z-[60] border-b border-gray-200 shadow-md">
		<!-- Header bar -->
		<div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center">

			<!-- Mobile: [hamburger] [logo 置中] [spacer] -->
			<div class="flex sm:hidden items-center w-full">
				<button
					@click="menuOpen = !menuOpen"
					class="flex-none p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
					aria-label="選單"
				>
					<X v-if="menuOpen" class="w-5 h-5" />
					<Menu v-else class="w-5 h-5" />
				</button>
				<div class="flex-1 flex justify-center">
					<a href="#" class="flex items-center gap-1.5">
						<img src="/logo-diyi.png" alt="第一保" class="h-8 w-auto" />
					</a>
				</div>
				<!-- spacer：使 logo 視覺置中 -->
				<div class="flex-none w-9"></div>
			</div>

			<!-- Desktop: logo 靠左 + nav 靠右 -->
			<a href="#" class="hidden sm:flex items-center gap-1.5 shrink-0">
				<img src="/logo-diyi.png" alt="第一保" class="h-8 w-auto" />
			</a>
			<nav class="hidden sm:flex items-center gap-1 ml-auto">
				<a
					v-for="link in navLinks"
					:key="link.label"
					href="#"
					:class="[
						'text-sm px-3 py-1.5 border-y-2 border-transparent',
						link.active
							? 'text-cyan-900 font-semibold border-b-red-600'
							: 'text-gray-600 hover:text-cyan-900 hover:bg-cyan-50 rounded transition-colors',
					]"
				>{{ link.label }}</a>
			</nav>
		</div>
	</header>

	<!-- Mobile 全螢幕 overlay：Teleport 至 body，z-[55] 壓過 action bar/nav panel，但低於 header z-[60] -->
	<Teleport to="body">
		<Transition
			enter-active-class="transition-all duration-200 ease-out"
			enter-from-class="opacity-0 -translate-y-3"
			enter-to-class="opacity-100 translate-y-0"
			leave-active-class="transition-all duration-150 ease-in"
			leave-from-class="opacity-100 translate-y-0"
			leave-to-class="opacity-0 -translate-y-3"
		>
		<div
			v-if="menuOpen"
			class="fixed inset-x-0 bottom-0 z-[55] bg-white overflow-y-auto sm:hidden"
			:style="{ top: '3.5rem' }"
		>
			<nav class="flex flex-col divide-y divide-gray-100">
				<a
					v-for="link in navLinks"
					:key="link.label"
					href="#"
					@click="menuOpen = false"
					:class="[
						'flex items-center justify-between px-6 py-5',
						link.active
							? 'text-cyan-900 font-semibold'
							: 'text-gray-800 hover:bg-gray-50 transition-colors',
					]"
				>
					<span class="text-xl">{{ link.label }}</span>
					<ChevronRight
						class="w-5 h-5 shrink-0"
						:class="link.active ? 'text-cyan-900' : 'text-cyan-600'"
					/>
				</a>
			</nav>
		</div>
		</Transition>
	</Teleport>
</template>

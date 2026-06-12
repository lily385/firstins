<script setup lang="ts">
import { ref, onMounted } from 'vue'

const show = ref(false)
const circleReady = ref(false)
const checkReady = ref(false)

onMounted(() => {
	// 確保初始 dashoffset 已渲染後再啟動 transition
	requestAnimationFrame(() => {
		show.value = true
		circleReady.value = true
		setTimeout(() => { checkReady.value = true }, 620)
	})
})
</script>

<template>
	<Teleport to="body">
		<div
			class="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-white"
			:class="show ? 'opacity-100' : 'opacity-0'"
			style="transition: opacity 0.2s ease-out"
		>
			<div class="flex flex-col items-center gap-7">
				<!-- SVG 動畫：圓形描邊 + checkmark -->
				<div class="relative w-32 h-32">
					<!-- 圓形（rotate -90 讓起點在頂部） -->
					<svg viewBox="0 0 96 96" class="absolute inset-0 w-full h-full -rotate-90">
						<!-- 灰色底圈 -->
						<circle cx="48" cy="48" r="44" fill="none" stroke="#e5e7eb" stroke-width="5" />
						<!-- 動畫描邊圈：使用 pathLength="100" 簡化計算 -->
						<circle
							cx="48" cy="48" r="44"
							fill="none" stroke="#164e63" stroke-width="5"
							stroke-linecap="round"
							pathLength="100"
							stroke-dasharray="100"
							:stroke-dashoffset="circleReady ? 0 : 100"
							style="transition: stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
						/>
					</svg>
					<!-- checkmark（不旋轉，獨立疊在上方） -->
					<svg viewBox="0 0 96 96" class="absolute inset-0 w-full h-full">
						<path
							d="M 26 50 L 42 66 L 70 34"
							fill="none" stroke="#164e63" stroke-width="6"
							stroke-linecap="round" stroke-linejoin="round"
							pathLength="100"
							stroke-dasharray="100"
							:stroke-dashoffset="checkReady ? 0 : 100"
							style="transition: stroke-dashoffset 0.45s ease-out"
						/>
					</svg>
				</div>

				<!-- 文字（check 出現後一起淡入） -->
				<div
					class="flex flex-col items-center gap-2 text-center"
					:class="checkReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'"
					style="transition: opacity 0.35s ease-out 0.1s, transform 0.35s ease-out 0.1s"
				>
					<p class="text-2xl font-bold text-cyan-900 tracking-wide">投保完成</p>
					<p class="text-sm text-gray-500 leading-relaxed">
						感謝您的投保<br>保單將於審核後寄送至您的信箱
					</p>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<template>
	<div class="max-w-4xl mx-auto py-6 px-4 space-y-6 pb-36">
		<AppStepper
			:steps="[{ label: '車主&車輛資料' }, { label: '選擇方案&商品' }, { label: '填寫&確認資料' }, { label: '付款' }]"
			:current="2"
		/>
		<PlanHeader planName="乙式車體險套餐" productName="任意險" effectiveDate="2026/05/21 中午12:00起，保期一年" />
		<section v-for="cat in data.categories" :key="cat.id" class="space-y-3">
			<!-- Category heading (outside card) -->
			<div>
				<h3 class="text-2xl font-semibold text-gray-900">{{ cat.name }}</h3>
				<p v-if="cat.description" class="mt-1 text-base text-gray-500">{{ cat.description }}</p>
			</div>

			<!-- Types list -->
			<div class="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 shadow-md">
				<!-- Category header -->
				<div class="bg-cyan-900 px-4 py-2.5">
					<span class="font-bold text-white text-lg">{{ cat.name }}</span>
				</div>

				<template v-for="(type, typeIdx) in cat.types" :key="type.id">
					<!-- Addon sub-section header -->
					<div
						v-if="cat.addonSectionLabel && type.mainOrAddon === '附加險' && (typeIdx === 0 || cat.types[typeIdx - 1].mainOrAddon !== '附加險')"
						class="bg-cyan-900 px-4 py-2 flex items-center gap-2"
					>
						<span class="font-bold text-white text-lg">{{ cat.addonSectionLabel }}</span>
						<span v-if="cat.addonSectionNote" class="text-sm text-gray-300">{{ cat.addonSectionNote }}</span>
					</div>

					<!-- choiceGroup 擇一標題 -->
					<div v-if="isChoiceGroupStart(type, cat)" class="px-4 pt-3 pb-1 text-xs text-gray-500 font-medium">
						下列商品擇一購買
					</div>

					<div class="px-4 py-4 transition-opacity" :class="{ 'opacity-40 pointer-events-none': !isEnabled(type) }">
						<!-- Checkbox row + desktop price -->
						<div class="flex items-start gap-3">
							<label class="flex items-center gap-3 cursor-pointer select-none flex-wrap flex-1" :for="`type-${type.id}`">
								<Checkbox
									:id="`type-${type.id}`"
									:model-value="state[type.id].checked"
									@update:model-value="(val) => handleToggle(type, Boolean(val))"
								/>
								<span class="flex items-center gap-1">
									<span class="text-lg font-semibold text-gray-800">{{ type.name }}</span>
									<InfoTooltip :text="type.tooltip" />
								</span>
								<!-- type-level tags -->
								<span v-if="type.tags.length" class="flex items-center gap-1 flex-wrap">
									<Badge v-for="tag in type.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
								</span>
							</label>
							<!-- Desktop price: 同列靠右 -->
							<span v-if="type.priceDiscount !== null" class="hidden sm:flex flex-col items-end gap-1 shrink-0" :class="{ 'opacity-40': !state[type.id].checked }">
								<span class="flex items-baseline gap-1">
									<span class="text-base text-cyan-900">網路優惠</span>
									<span class="text-xl text-cyan-900">{{ formatPrice(effectivePrices[type.id]!) }}</span><span class="text-sm text-cyan-900">元</span>
								</span>
								<span class="text-sm text-gray-400 line-through">
									{{ formatPrice(effectiveOriginalPrices[type.id]!) }} 元
								</span>
							</span>
						</div>
						<!-- description note -->
						<div v-if="type.description" class="mt-1 ml-6 text-xs text-red-600">{{ type.description }}</div>

						<!-- Expanded content when checked -->
						<div v-if="state[type.id].checked && (type.options.length || type.fields.length)" class="mt-3 ml-6 space-y-4">
							<!-- radio: pick one option, show only selected option's fields -->
							<template v-if="type.optionMode === 'radio'">
								<RadioGroup v-model="state[type.id].selectedOption" class="flex flex-col gap-4">
								<div v-for="opt in type.options" :key="opt.id" class="space-y-2">
									<label class="flex items-center gap-3 cursor-pointer flex-wrap" :for="`${type.id}-${opt.id}`">
										<RadioGroupItem :id="`${type.id}-${opt.id}`" :value="opt.id" />
										<span class="flex items-center gap-1">
											<span class="text-base font-medium text-gray-700">{{ opt.name }}</span>
											<InfoTooltip :text="opt.tooltip" />
										</span>
										<span v-if="opt.tags.length" class="flex items-center gap-1 flex-wrap">
											<Badge v-for="tag in opt.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
										</span>
									</label>
									<div v-if="state[type.id].selectedOption === opt.id && opt.fields.length" class="ml-6 space-y-3">
										<div v-for="field in opt.fields" :key="field.id" class="space-y-1">
											<div class="flex items-center gap-2 text-lg text-gray-800 font-semibold flex-wrap">
												<span>{{ field.label }}</span>
												<InfoTooltip :text="field.tooltip" />
												<Badge v-for="tag in field.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
											</div>
											<div class="flex gap-8 flex-wrap">
												<Select
													v-for="sel in field.selects"
													:key="sel.id"
													v-model="state[type.id].selects[sel.id]"
												>
													<SelectTrigger class="h-auto py-3 text-base w-full sm:w-[250px]">
														<SelectValue />
													</SelectTrigger>
													<SelectContent position="popper">
														<SelectItem v-for="c in sel.choices" :key="c" :value="c">{{ c }}</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								</div>
								</RadioGroup>
							</template>

							<!-- radio-always: all options shown, unselected grayed out -->
							<template v-else-if="type.optionMode === 'radio-always'">
								<RadioGroup v-model="state[type.id].selectedOption" class="flex flex-col gap-4">
								<div v-for="opt in type.options" :key="opt.id" class="space-y-2">
									<label class="flex items-center gap-3 cursor-pointer flex-wrap" :for="`${type.id}-${opt.id}`">
										<RadioGroupItem :id="`${type.id}-${opt.id}`" :value="opt.id" />
										<span class="flex items-center gap-1">
											<span class="text-base font-medium text-gray-700">{{ opt.name }}</span>
											<InfoTooltip :text="opt.tooltip" />
										</span>
										<span v-if="opt.tags.length" class="flex items-center gap-1 flex-wrap">
											<Badge v-for="tag in opt.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
										</span>
									</label>
									<div v-if="opt.fields.length" class="ml-6 space-y-3">
										<div v-for="field in opt.fields" :key="field.id" class="space-y-1">
											<div class="flex items-center gap-2 text-lg text-gray-800 font-semibold flex-wrap">
												<span>{{ field.label }}</span>
												<InfoTooltip :text="field.tooltip" />
												<Badge v-for="tag in field.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
											</div>
											<div class="flex gap-8 flex-wrap">
												<template v-if="state[type.id].selectedOption === opt.id">
													<Select
														v-for="sel in field.selects"
														:key="sel.id"
														v-model="state[type.id].selects[sel.id]"
													>
														<SelectTrigger class="h-auto py-3 text-base w-full sm:w-[250px]">
															<SelectValue />
														</SelectTrigger>
														<SelectContent position="popper">
															<SelectItem v-for="c in sel.choices" :key="c" :value="c">{{ c }}</SelectItem>
														</SelectContent>
													</Select>
												</template>
												<template v-else>
													<span v-for="sel in field.selects" :key="sel.id" class="text-base text-gray-400 px-4 py-2.5">{{
														state[type.id].selects[sel.id]
													}}</span>
												</template>
											</div>
										</div>
									</div>
								</div>
								</RadioGroup>
							</template>

							<!-- always: all sub-options always shown with their fields -->
							<template v-else-if="type.optionMode === 'always'">
								<div v-for="opt in type.options" :key="opt.id" class="space-y-2">
									<div class="flex items-center gap-3 flex-wrap">
										<span class="flex items-center gap-1">
											<span class="text-base font-medium text-gray-600">{{ opt.name }}</span>
											<InfoTooltip :text="opt.tooltip" />
										</span>
										<span v-if="opt.tags.length" class="flex items-center gap-1 flex-wrap">
											<Badge v-for="tag in opt.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
										</span>
									</div>
									<div class="ml-2 space-y-3">
										<div v-for="field in opt.fields" :key="field.id" class="space-y-1">
											<div class="flex items-center gap-2 text-lg text-gray-800 font-semibold flex-wrap">
												<span>{{ field.label }}</span>
												<InfoTooltip :text="field.tooltip" />
												<Badge v-for="tag in field.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
											</div>
											<div class="flex gap-8 flex-wrap">
												<Select
													v-for="sel in field.selects"
													:key="sel.id"
													v-model="state[type.id].selects[sel.id]"
												>
													<SelectTrigger class="h-auto py-3 text-base w-full sm:w-[250px]">
														<SelectValue />
													</SelectTrigger>
													<SelectContent position="popper">
														<SelectItem v-for="c in sel.choices" :key="c" :value="c">{{ c }}</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								</div>
							</template>

							<!-- no options: direct fields -->
							<template v-else>
								<div v-for="field in type.fields" :key="field.id" class="space-y-2">
									<!-- Column mode: each select has its own label (e.g. field 31) -->
									<template v-if="field.selects.some(s => s.label)">
										<div class="flex gap-8 flex-wrap items-end">
											<div v-for="sel in field.selects" :key="sel.id" class="space-y-2 w-full sm:w-auto">
												<div class="flex items-center gap-2 text-lg text-gray-800 font-semibold flex-wrap">
													<span>{{ sel.label }}</span>
													<InfoTooltip v-if="sel.tooltip" :text="sel.tooltip" />
													<Badge v-for="tag in (sel.tags ?? [])" :key="tag" variant="secondary">{{ tag }}</Badge>
												</div>
												<Select v-model="state[type.id].selects[sel.id]">
													<SelectTrigger class="h-auto py-3 text-base w-full sm:w-[250px]">
														<SelectValue />
													</SelectTrigger>
													<SelectContent position="popper">
														<SelectItem v-for="c in sel.choices" :key="c" :value="c">{{ c }}</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div v-if="field.note" class="text-sm text-red-600 mt-1">{{ field.note }}</div>
									</template>
									<!-- Row mode: single label above all selects -->
									<template v-else>
										<div class="flex items-center gap-2 text-lg text-gray-800 font-semibold flex-wrap">
											<span>{{ field.label }}</span>
											<InfoTooltip v-if="field.tooltip" :text="field.tooltip" />
											<Badge v-for="tag in (field.tags ?? [])" :key="tag" variant="secondary">{{ tag }}</Badge>
										</div>
										<div class="flex gap-8 flex-wrap">
											<Select
												v-for="sel in field.selects"
												:key="sel.id"
												v-model="state[type.id].selects[sel.id]"
											>
												<SelectTrigger class="h-auto py-3 text-base w-full sm:w-[250px]">
													<SelectValue />
												</SelectTrigger>
												<SelectContent position="popper">
													<SelectItem v-for="c in sel.choices" :key="c" :value="c">{{ c }}</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div v-if="field.note" class="text-sm text-red-600 mt-1">{{ field.note }}</div>
									</template>
								</div>
							</template>
						</div>
						<!-- Mobile price: 展開內容最下方 -->
						<div v-if="type.priceDiscount !== null" class="flex sm:hidden flex-col items-end gap-1 mt-4" :class="{ 'opacity-40': !state[type.id].checked }">
							<span class="flex items-baseline gap-1">
								<span class="text-base text-cyan-900">網路優惠</span>
								<span class="text-xl text-cyan-900">{{ formatPrice(effectivePrices[type.id]!) }}</span><span class="text-sm text-cyan-900">元</span>
							</span>
							<span class="text-sm text-gray-400 line-through">
								{{ formatPrice(effectiveOriginalPrices[type.id]!) }} 元
							</span>
						</div>
					</div>
				</template>
			</div>
		</section>
	</div>

	<LoadingOverlay v-if="isLoading" />

	<!-- Fixed Action Bar -->
	<div class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-5 flex flex-col sm:flex-row sm:items-center">
			<!-- price info: mobile 在上方，desktop 在右側 -->
			<div class="flex flex-col mb-3 sm:mb-0 sm:ml-auto sm:shrink-0 sm:w-52 sm:pl-8 sm:order-2">
				<div class="flex items-center justify-between gap-3">
					<span class="text-xs text-gray-500 whitespace-nowrap">優惠金額</span>
					<span class="text-red-600 font-semibold text-sm whitespace-nowrap">
						{{ totalDiscount !== null && totalDiscount > 0 ? `- ${formatPrice(totalDiscount)}` : '-' }} 元
					</span>
				</div>
				<div class="flex items-baseline justify-between gap-3 mt-0.5">
					<span class="text-lg font-bold text-gray-900 whitespace-nowrap">總保費</span>
					<span class="text-lg font-bold text-gray-900 whitespace-nowrap">{{ totalPremium !== null ? formatPrice(totalPremium) : '-' }} 元</span>
				</div>
			</div>
			<!-- 分隔線：mobile 顯示，desktop 隱藏 -->
			<hr class="sm:hidden border-gray-200" />
			<!-- buttons: mobile 各佔 50%，desktop 固定寬 -->
			<div class="flex items-center gap-3 sm:gap-6 shrink-0 sm:order-1">
				<button class="flex-1 sm:flex-none sm:w-60 py-2 rounded-lg border-2 border-cyan-900 text-cyan-900 text-lg font-semibold hover:bg-cyan-50 transition-colors cursor-pointer">
					上一步
				</button>
				<button @click="calculate" class="flex-1 sm:flex-none sm:w-60 py-2 rounded-lg bg-cyan-900 text-white text-lg font-semibold hover:bg-cyan-800 transition-colors cursor-pointer">
					{{ isCalculated ? '下一步' : '試算保費' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import LoadingOverlay from './LoadingOverlay.vue'
import { insuranceData } from '../store/insuranceStore'
import { useInsuranceForm } from '../composables/useInsuranceForm'
import { formatPrice } from '../utils/formatters'
import type { Category } from '../types/insurance'
import InfoTooltip from './InfoTooltip.vue'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppStepper from './AppStepper.vue'
import PlanHeader from './PlanHeader.vue'

// insuranceData is readonly; cast to mutable for the composable which only reads from it
const data = insuranceData as unknown as { categories: Category[] }

const { state, effectivePrices, effectiveOriginalPrices, isEnabled, setTypeChecked, isChoiceGroupStart } =
	useInsuranceForm(data)

const totalPremium = ref<number | null>(null)
const totalDiscount = ref<number | null>(null)
const isLoading = ref(false)
const isCalculated = ref(false)

function resetBar() {
	isCalculated.value = false
	totalPremium.value = null
	totalDiscount.value = null
}

function handleToggle(type: import('../types/insurance').InsuranceType, newChecked: boolean) {
	setTypeChecked(type, newChecked)
	if (isCalculated.value) resetBar()
}

// Reset action bar whenever any select value changes
watch(() => state, () => { if (isCalculated.value) resetBar() }, { deep: true })

async function calculate() {
	isLoading.value = true
	await new Promise(resolve => setTimeout(resolve, 2000))
	let premium = 0
	let discount = 0
	for (const cat of data.categories) {
		for (const type of cat.types) {
			const price = effectivePrices.value[type.id]
			const orig = effectiveOriginalPrices.value[type.id]
			if (state[type.id]?.checked && price != null) {
				premium += price
				if (orig != null) discount += orig - price
			}
		}
	}
	totalPremium.value = premium
	totalDiscount.value = discount
	isLoading.value = false
	isCalculated.value = true
}
</script>

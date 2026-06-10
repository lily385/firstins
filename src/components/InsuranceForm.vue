<template>
	<div class="max-w-3xl mx-auto py-6 px-4 space-y-6">
		<AppStepper
			:steps="[{ label: '車主&車輛資料' }, { label: '選擇方案&商品' }, { label: '填寫&確認資料' }, { label: '付款' }]"
			:current="2"
		/>
		<PlanHeader planName="乙式車體險套餐" productName="任意險" effectiveDate="2026/05/21 中午12:00起，保期一年" />
		<section v-for="cat in data.categories" :key="cat.id" class="space-y-3">
			<!-- Category heading (outside card) -->
			<div>
				<h3 class="text-lg font-bold text-gray-900">{{ cat.name }}</h3>
				<p v-if="cat.description" class="mt-1 text-sm text-gray-500">{{ cat.description }}</p>
			</div>

			<!-- Types list -->
			<div class="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
				<!-- Category header -->
				<div class="bg-cyan-900 px-4 py-2.5">
					<span class="font-bold text-white text-sm">{{ cat.name }}</span>
				</div>

				<template v-for="(type, typeIdx) in cat.types" :key="type.id">
					<!-- Addon sub-section header -->
					<div
						v-if="cat.addonSectionLabel && type.mainOrAddon === '附加險' && (typeIdx === 0 || cat.types[typeIdx - 1].mainOrAddon !== '附加險')"
						class="bg-cyan-900 px-4 py-2 flex items-center gap-2"
					>
						<span class="font-bold text-white text-sm">{{ cat.addonSectionLabel }}</span>
						<span v-if="cat.addonSectionNote" class="text-xs text-gray-300">{{ cat.addonSectionNote }}</span>
					</div>

					<!-- choiceGroup 擇一標題 -->
					<div v-if="isChoiceGroupStart(type, cat)" class="px-4 pt-3 pb-1 text-xs text-gray-500 font-medium">
						下列商品擇一購買
					</div>

					<div class="px-4 py-4 transition-opacity" :class="{ 'opacity-40 pointer-events-none': !isEnabled(type) }">
						<!-- Checkbox row -->
						<label class="flex items-center gap-3 cursor-pointer select-none flex-wrap">
							<input
								type="checkbox"
								class="w-4 h-4 accent-cyan-900"
								:checked="state[type.id].checked"
								@change="toggleType(type)"
							/>
							<span class="flex items-center gap-1">
								<span class="font-semibold text-gray-800">{{ type.name }}</span>
								<InfoTooltip :text="type.tooltip" />
							</span>
							<!-- type-level tags -->
							<span v-if="type.tags.length" class="flex items-center gap-1 flex-wrap">
								<Badge v-for="tag in type.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
							</span>
							<!-- price -->
							<template v-if="type.priceDiscount !== null">
								<span class="ml-auto flex flex-col items-end gap-0.5">
									<span class="text-cyan-900 font-semibold text-sm">
										網路優惠 {{ formatPrice(effectivePrices[type.id]!) }} 元
									</span>
									<span class="text-gray-400 text-xs line-through">
										{{ formatPrice(effectiveOriginalPrices[type.id]!) }} 元
									</span>
								</span>
							</template>
						</label>
						<!-- description note -->
						<div v-if="type.description" class="mt-1 ml-6 text-xs text-red-600">{{ type.description }}</div>

						<!-- Expanded content when checked -->
						<div v-if="state[type.id].checked && (type.options.length || type.fields.length)" class="mt-3 ml-6 space-y-4">
							<!-- radio: pick one option, show only selected option's fields -->
							<template v-if="type.optionMode === 'radio'">
								<div v-for="opt in type.options" :key="opt.id" class="space-y-2">
									<label class="flex items-center gap-3 cursor-pointer flex-wrap">
										<input
											type="radio"
											class="w-4 h-4 accent-cyan-900"
											:name="type.id"
											:value="opt.id"
											v-model="state[type.id].selectedOption"
										/>
										<span class="flex items-center gap-1">
											<span class="text-sm font-medium text-gray-700">{{ opt.name }}</span>
											<InfoTooltip :text="opt.tooltip" />
										</span>
										<span v-if="opt.tags.length" class="flex items-center gap-1 flex-wrap">
											<Badge v-for="tag in opt.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
										</span>
									</label>
									<div v-if="state[type.id].selectedOption === opt.id && opt.fields.length" class="ml-6 space-y-3">
										<div v-for="field in opt.fields" :key="field.id" class="space-y-1">
											<div class="flex items-center gap-2 text-xs text-gray-800 font-semibold flex-wrap">
												<span>{{ field.label }}</span>
												<InfoTooltip :text="field.tooltip" />
												<Badge v-for="tag in field.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
											</div>
											<div class="flex gap-2 flex-wrap">
												<select
													v-for="sel in field.selects"
													:key="sel.id"
													v-model="state[type.id].selects[sel.id]"
													class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-cyan-900"
												>
													<option v-for="c in sel.choices" :key="c" :value="c">{{ c }}</option>
												</select>
											</div>
										</div>
									</div>
								</div>
							</template>

							<!-- radio-always: all options shown, unselected grayed out -->
							<template v-else-if="type.optionMode === 'radio-always'">
								<div v-for="opt in type.options" :key="opt.id" class="space-y-2">
									<label class="flex items-center gap-3 cursor-pointer flex-wrap">
										<input
											type="radio"
											class="w-4 h-4 accent-cyan-900"
											:name="type.id"
											:value="opt.id"
											v-model="state[type.id].selectedOption"
										/>
										<span class="flex items-center gap-1">
											<span class="text-sm font-medium text-gray-700">{{ opt.name }}</span>
											<InfoTooltip :text="opt.tooltip" />
										</span>
										<span v-if="opt.tags.length" class="flex items-center gap-1 flex-wrap">
											<Badge v-for="tag in opt.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
										</span>
									</label>
									<div v-if="opt.fields.length" class="ml-6 space-y-3">
										<div v-for="field in opt.fields" :key="field.id" class="space-y-1">
											<div class="flex items-center gap-2 text-xs text-gray-800 font-semibold flex-wrap">
												<span>{{ field.label }}</span>
												<InfoTooltip :text="field.tooltip" />
												<Badge v-for="tag in field.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
											</div>
											<div class="flex gap-2 flex-wrap">
												<template v-if="state[type.id].selectedOption === opt.id">
													<select
														v-for="sel in field.selects"
														:key="sel.id"
														v-model="state[type.id].selects[sel.id]"
														class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-cyan-900"
													>
														<option v-for="c in sel.choices" :key="c" :value="c">{{ c }}</option>
													</select>
												</template>
												<template v-else>
													<span v-for="sel in field.selects" :key="sel.id" class="text-sm text-gray-400 px-2 py-1.5">{{
														state[type.id].selects[sel.id]
													}}</span>
												</template>
											</div>
										</div>
									</div>
								</div>
							</template>

							<!-- always: all sub-options always shown with their fields -->
							<template v-else-if="type.optionMode === 'always'">
								<div v-for="opt in type.options" :key="opt.id" class="space-y-2">
									<div class="flex items-center gap-3 flex-wrap">
										<span class="flex items-center gap-1">
											<span class="text-sm font-medium text-gray-600">{{ opt.name }}</span>
											<InfoTooltip :text="opt.tooltip" />
										</span>
										<span v-if="opt.tags.length" class="flex items-center gap-1 flex-wrap">
											<Badge v-for="tag in opt.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
										</span>
									</div>
									<div class="ml-2 space-y-3">
										<div v-for="field in opt.fields" :key="field.id" class="space-y-1">
											<div class="flex items-center gap-2 text-xs text-gray-800 font-semibold flex-wrap">
												<span>{{ field.label }}</span>
												<InfoTooltip :text="field.tooltip" />
												<Badge v-for="tag in field.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
											</div>
											<div class="flex gap-2 flex-wrap">
												<select
													v-for="sel in field.selects"
													:key="sel.id"
													v-model="state[type.id].selects[sel.id]"
													class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-cyan-900"
												>
													<option v-for="c in sel.choices" :key="c" :value="c">{{ c }}</option>
												</select>
											</div>
										</div>
									</div>
								</div>
							</template>

							<!-- no options: direct fields -->
							<template v-else>
								<div v-for="field in type.fields" :key="field.id" class="space-y-1">
									<div class="flex items-center gap-2 text-xs text-gray-800 font-semibold flex-wrap">
										<span>{{ field.label }}</span>
										<InfoTooltip :text="field.tooltip" />
										<Badge v-for="tag in field.tags" :key="tag" variant="secondary">{{ tag }}</Badge>
									</div>
									<div class="flex gap-2 flex-wrap">
										<select
											v-for="sel in field.selects"
											:key="sel.id"
											v-model="state[type.id].selects[sel.id]"
											class="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-cyan-900"
										>
											<option v-for="c in sel.choices" :key="c" :value="c">{{ c }}</option>
										</select>
									</div>
								</div>
							</template>
						</div>
					</div>
				</template>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { insuranceData } from '../store/insuranceStore'
import { useInsuranceForm } from '../composables/useInsuranceForm'
import { formatPrice } from '../utils/formatters'
import type { Category } from '../types/insurance'
import InfoTooltip from './InfoTooltip.vue'
import { Badge } from '@/components/ui/badge'
import AppStepper from './AppStepper.vue'
import PlanHeader from './PlanHeader.vue'

// insuranceData is readonly; cast to mutable for the composable which only reads from it
const data = insuranceData as unknown as { categories: Category[] }

const { state, effectivePrices, effectiveOriginalPrices, isEnabled, toggleType, isChoiceGroupStart } =
	useInsuranceForm(data)
</script>

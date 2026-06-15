<template>
	<div class="max-w-4xl mx-auto py-6 px-4 pb-16 space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-semibold text-gray-900">後台設定</h2>
			<button
				@click="handleReset"
				class="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
			>
				重設為預設值
			</button>
		</div>

		<!-- Categories -->
		<section v-for="cat in data.categories" :key="cat.id">
			<div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
				<!-- Category header -->
				<div class="bg-cyan-900 px-4 py-1.5.5">
					<span class="font-bold text-white text-lg">{{ cat.name }}</span>
				</div>

				<!-- Types -->
				<template v-for="(type, typeIdx) in cat.types" :key="type.id">
					<!-- Addon sub-section header -->
					<div
						v-if="cat.addonSectionLabel && type.mainOrAddon === '附加險' && (typeIdx === 0 || cat.types[typeIdx - 1].mainOrAddon !== '附加險')"
						class="bg-cyan-900 px-4 py-1.5 flex items-center gap-2"
					>
						<span class="font-bold text-white text-lg">{{ cat.addonSectionLabel }}</span>
						<span v-if="cat.addonSectionNote" class="text-sm text-gray-300">{{ cat.addonSectionNote }}</span>
					</div>

					<!-- Type block -->
					<div class="px-4 py-4 border-t border-gray-100 space-y-5">
						<div class="font-medium text-gray-800">{{ type.name }}</div>

						<!-- ① 險種標籤 -->
						<div class="space-y-2">
							<div class="text-xs font-medium text-gray-500">險種標籤</div>
							<div class="flex items-center gap-1.5 flex-wrap">
								<span
									v-for="tag in ALL_TAGS"
									:key="tag"
									@click="toggleTag(type.tags, tag)"
									class="cursor-pointer select-none text-xs px-1.5 py-0.5 rounded border transition-colors"
									:class="type.tags.includes(tag)
										? 'border-gray-500 bg-gray-200 text-gray-800'
										: 'border-gray-200 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600'"
								>{{ tag }}</span>
							</div>
						</div>

						<!-- ② 選項標籤 (options) -->
						<div v-if="type.options.length" class="space-y-2">
							<div class="text-xs font-medium text-gray-500">選項標籤</div>
							<div v-for="opt in type.options" :key="opt.id" class="space-y-1">
								<div class="text-xs text-gray-400">{{ opt.name }}</div>
								<div class="flex items-center gap-1.5 flex-wrap pl-2">
									<span
										v-for="tag in ALL_TAGS"
										:key="tag"
										@click="toggleTag(opt.tags, tag)"
										class="cursor-pointer select-none text-xs px-1.5 py-0.5 rounded border transition-colors"
										:class="opt.tags.includes(tag)
											? 'border-gray-500 bg-gray-200 text-gray-800'
											: 'border-gray-200 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600'"
									>{{ tag }}</span>
								</div>
							</div>
						</div>

						<!-- ② 選項標籤 (direct fields) -->
						<div v-if="type.fields.length" class="space-y-2">
							<div class="text-xs font-medium text-gray-500">選項標籤</div>
							<div v-for="field in type.fields" :key="field.id" class="space-y-1">
								<div class="text-xs text-gray-400">{{ field.label }}</div>
								<div class="flex items-center gap-1.5 flex-wrap pl-2">
									<span
										v-for="tag in ALL_TAGS"
										:key="tag"
										@click="toggleFieldTag(field, tag)"
										class="cursor-pointer select-none text-xs px-1.5 py-0.5 rounded border transition-colors"
										:class="(field.tags ?? []).includes(tag)
											? 'border-gray-500 bg-gray-200 text-gray-800'
											: 'border-gray-200 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600'"
									>{{ tag }}</span>
								</div>
							</div>
						</div>

						<!-- ③ 基礎保費 -->
						<div v-if="type.priceDiscount !== null" class="space-y-1">
							<div class="text-xs font-medium text-gray-500">基礎保費（元）</div>
							<Input
								type="number"
								:value="type.priceDiscount"
								@change="updateBasePrice(type, Number(($event.target as HTMLInputElement).value))"
								class="w-40 py-1.5"
							/>
						</div>

						<!-- ④ 保額選項 -->
						<div
							v-for="item in getAllSelects(type)"
							:key="item.sel.id"
							class="space-y-2"
						>
							<div class="flex items-baseline gap-2">
								<span class="text-sm text-gray-700">{{ item.fieldLabel }}</span>
								<span class="text-xs text-gray-400 font-mono">{{ item.sel.id }}</span>
							</div>

							<!-- Rows -->
							<div
								v-for="(choice, idx) in item.sel.choices"
								:key="idx"
								class="flex items-start gap-4 border-b border-gray-100 last:border-0 py-1.5"
							>
								<!-- 選項 + 單位 -->
								<div class="shrink-0 flex flex-col gap-1.5">
									<div v-if="idx === 0" class="flex items-center text-xs text-gray-500 font-medium mb-1">
										<div class="w-9 shrink-0"></div>
										<div class="pr-6 flex items-center gap-4">
											<div class="w-[100px]">選項</div>
											<div class="w-[80px]">單位</div>
										</div>
									</div>
									<div v-for="(part, partIdx) in parseChoice(choice)" :key="partIdx" class="flex items-center">
										<div class="w-9 shrink-0 flex items-center justify-center">
											<span v-if="partIdx === 0" class="w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-xs font-medium flex items-center justify-center shrink-0">{{ idx + 1 }}</span>
										</div>
											<div class="pr-6 flex items-center gap-4">
											<Input
												type="number"
												:value="part.num"
												@change="updatePart(item.sel, idx, partIdx, 'num', ($event.target as HTMLInputElement).value)"
												class="w-[100px] py-1.5"
												placeholder="數值"
											/>
											<Select
												:model-value="part.unit"
												@update:model-value="val => updatePart(item.sel, idx, partIdx, 'unit', String(val))"
											>
												<SelectTrigger class="w-[80px] py-1.5 text-base">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem v-for="u in UNITS" :key="u" :value="u">{{ u }}</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div class="w-5 shrink-0">
											<button
												v-if="parseChoice(choice).length > 1"
												@click="removePart(item.sel, idx, partIdx)"
												class="text-red-400 hover:text-red-600 cursor-pointer"
											><X :size="14" /></button>
										</div>
									</div>
									<button
										@click="addPart(item.sel, idx)"
										class="text-xs text-cyan-700 hover:text-cyan-900 self-start cursor-pointer pl-9"
									>+ 加段</button>
								</div>

								<!-- 價差 + 最終價格 -->
								<div class="shrink-0">
									<div v-if="idx === 0" class="pl-6 flex items-center gap-4 text-xs text-gray-500 font-medium mb-1">
										<div class="w-[100px]">價差</div>
										<div class="w-[100px]">最終價格</div>
									</div>
									<div class="px-6 flex items-center gap-4">
										<Input
											type="number"
											:value="item.sel.priceDelta?.[idx] ?? 0"
											@change="updateDelta(item.sel, idx, Number(($event.target as HTMLInputElement).value))"
											class="w-[100px] py-1.5"
										/>
										<div class="w-[100px] py-1.5 px-3 text-base text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
											{{ (type.priceDiscount ?? 0) + (item.sel.priceDelta?.[idx] ?? 0) }} 元
										</div>
									</div>
								</div>

								<!-- 刪除 -->
								<div class="ml-auto shrink-0 pt-1">
									<button
										@click="deleteChoice(item.sel, idx)"
										:disabled="item.sel.choices.length <= 1"
										class="text-xs text-red-500 border border-red-400 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
									>
										刪除
									</button>
								</div>
							</div>

							<button
								@click="addChoice(item.sel)"
								class="text-xs text-cyan-900 border border-cyan-300 rounded px-2 py-1 hover:bg-cyan-50 transition-colors cursor-pointer"
							>
								+ 新增選項
							</button>
						</div>

						<p v-if="getAllSelects(type).length === 0 && !type.options.length" class="text-sm text-gray-400">此險種無保額選項</p>
					</div>
				</template>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { insuranceMutableData as data, resetData, saveData } from '../store/insuranceStore'
import type { InsuranceType, FieldDef, SelectDef } from '../types/insurance'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from '@lucide/vue'

function updateBasePrice(type: InsuranceType, value: number): void {
	type.priceDiscount = value
	saveData()
}

function getAllSelects(type: InsuranceType): { fieldLabel: string; sel: SelectDef }[] {
	const result: { fieldLabel: string; sel: SelectDef }[] = []
	const allFields = [...type.fields, ...type.options.flatMap((o) => o.fields)]
	for (const field of allFields) {
		for (const sel of field.selects) {
			result.push({ fieldLabel: field.label, sel })
		}
	}
	return result
}

const ALL_TAGS = ['保對方', '對方', '保我方乘客', '對方車或財物', '保自己', '額外保障', '保本車']

const UNITS = ['元', '萬元', '倍型']

interface Part {
	num: string
	unit: string
}

function parseChoice(choice: string): Part[] {
	return choice.split('/').map(segment => {
		const m = segment.match(/^(\d*(?:\.\d+)?)(元|萬元|倍型)$/)
		return m ? { num: m[1], unit: m[2] } : { num: segment, unit: '萬元' }
	})
}

function assembleChoice(parts: Part[]): string {
	return parts.map(p => `${p.num}${p.unit}`).join('/')
}

function updatePart(sel: SelectDef, choiceIdx: number, partIdx: number, field: 'num' | 'unit', value: string): void {
	const parts = parseChoice(sel.choices[choiceIdx])
	parts[partIdx] = { ...parts[partIdx], [field]: value }
	updateChoice(sel, choiceIdx, assembleChoice(parts))
}

function addPart(sel: SelectDef, choiceIdx: number): void {
	const parts = parseChoice(sel.choices[choiceIdx])
	parts.push({ num: '', unit: '萬元' })
	updateChoice(sel, choiceIdx, assembleChoice(parts))
}

function removePart(sel: SelectDef, choiceIdx: number, partIdx: number): void {
	const parts = parseChoice(sel.choices[choiceIdx])
	parts.splice(partIdx, 1)
	updateChoice(sel, choiceIdx, assembleChoice(parts))
}

function toggleFieldTag(field: FieldDef, tag: string): void {
	if (!field.tags) field.tags = []
	toggleTag(field.tags, tag)
}

function toggleTag(tags: string[], tag: string): void {
	const idx = tags.indexOf(tag)
	if (idx >= 0) tags.splice(idx, 1)
	else tags.push(tag)
	saveData()
}

function updateChoice(sel: SelectDef, idx: number, value: string): void {
	const wasDefault = sel.choices[idx] === sel.default
	sel.choices[idx] = value
	if (wasDefault) sel.default = value
	saveData()
}

function updateDelta(sel: SelectDef, idx: number, value: number): void {
	if (!sel.priceDelta) sel.priceDelta = sel.choices.map(() => 0)
	sel.priceDelta[idx] = value
	saveData()
}

function deleteChoice(sel: SelectDef, idx: number): void {
	sel.choices.splice(idx, 1)
	sel.priceDelta?.splice(idx, 1)
	if (!sel.choices.includes(sel.default)) {
		sel.default = sel.choices[0] ?? ''
	}
	saveData()
}

function addChoice(sel: SelectDef): void {
	sel.choices.push('')
	if (!sel.priceDelta) sel.priceDelta = sel.choices.map(() => 0)
	else sel.priceDelta.push(0)
	saveData()
}

function handleReset(): void {
	if (confirm('確定要重設為預設值嗎？所有後台調整將會清除。')) {
		resetData()
	}
}
</script>

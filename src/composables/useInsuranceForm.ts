import { reactive, computed } from 'vue'
import type { Category, FieldDef, InsuranceType } from '../types/insurance'

interface TypeState {
	checked: boolean
	selectedOption: string
	selects: Record<string, string>
}

type FormState = Record<string, TypeState>

function buildState(categories: Category[]): FormState {
	const result: FormState = {}
	for (const cat of categories) {
		for (const type of cat.types) {
			const selects: Record<string, string> = {}
			for (const field of type.fields) {
				for (const sel of field.selects) selects[sel.id] = sel.default
			}
			for (const opt of type.options) {
				for (const field of opt.fields) {
					for (const sel of field.selects) selects[sel.id] = sel.default
				}
			}
			result[type.id] = {
				checked: type.defaultChecked,
				selectedOption: type.options[0]?.id ?? '',
				selects,
			}
		}
	}
	return result
}

function getActiveFields(type: InsuranceType, state: FormState): FieldDef[] {
	if (type.optionMode === 'radio' || type.optionMode === 'radio-always')
		return type.options.find((o) => o.id === state[type.id].selectedOption)?.fields ?? []
	if (type.optionMode === 'always') return type.options.flatMap((o) => o.fields)
	return type.fields
}

function calcEffectivePrice(type: InsuranceType, state: FormState): number | null {
	if (type.priceDiscount === null) return null
	let delta = 0
	for (const field of getActiveFields(type, state)) {
		for (const sel of field.selects) {
			if (!sel.priceDelta) continue
			const idx = sel.choices.indexOf(state[type.id].selects[sel.id])
			if (idx >= 0) delta += sel.priceDelta[idx] ?? 0
		}
	}
	return type.priceDiscount + delta
}

function calcEffectiveOriginalPrice(type: InsuranceType, state: FormState): number | null {
	if (type.price === null || type.priceDiscount === null) return null
	const disc = calcEffectivePrice(type, state)
	if (disc === null) return null
	return Math.round(disc * (type.price / type.priceDiscount))
}

export function useInsuranceForm(data: { categories: Category[] }) {
	const allTypes: InsuranceType[] = data.categories.flatMap((cat) => cat.types)

	const state = reactive(buildState(data.categories))

	const effectivePrices = computed<Record<string, number | null>>(() =>
		Object.fromEntries(allTypes.map((t) => [t.id, calcEffectivePrice(t, state)]))
	)

	const effectiveOriginalPrices = computed<Record<string, number | null>>(() =>
		Object.fromEntries(allTypes.map((t) => [t.id, calcEffectiveOriginalPrice(t, state)]))
	)

	function isEnabled(type: InsuranceType): boolean {
		if (type.parentMain === null) return true
		const parent = allTypes.find((t) => t.name === type.parentMain)
		return parent ? state[parent.id].checked : true
	}

	function toggleType(type: InsuranceType): void {
		state[type.id].checked = !state[type.id].checked
		if (type.choiceGroup !== null && state[type.id].checked) {
			for (const other of allTypes) {
				if (other.id !== type.id && other.choiceGroup === type.choiceGroup) {
					state[other.id].checked = false
				}
			}
		}
	}

	function isChoiceGroupStart(type: InsuranceType, cat: Category): boolean {
		if (!type.choiceGroup) return false
		return cat.types.find((t) => t.choiceGroup === type.choiceGroup)?.id === type.id
	}

	return {
		state,
		effectivePrices,
		effectiveOriginalPrices,
		isEnabled,
		toggleType,
		isChoiceGroupStart,
	}
}

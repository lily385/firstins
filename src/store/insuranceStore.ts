import rawData from '../data/insurance.json'
import { reactive, readonly } from 'vue'
import type { Category } from '../types/insurance'

const STORAGE_KEY = 'insurance-admin-config-v2'

function loadData(): { categories: Category[] } {
	try {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved) return JSON.parse(saved)
	} catch {}
	return JSON.parse(JSON.stringify(rawData))
}

const _data = reactive(loadData()) as { categories: Category[] }

// Read-only view for consumers that should only read (InsuranceForm, InsuranceTable)
export const insuranceData = readonly(_data)

// Mutable reference for InsuranceAdmin which needs to write directly
export const insuranceMutableData = _data

export function saveData(): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(_data))
}

export function resetData(): void {
	const fresh = JSON.parse(JSON.stringify(rawData)) as { categories: Category[] }
	_data.categories = fresh.categories
	saveData()
}

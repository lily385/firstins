import { describe, it, expect, beforeEach, vi } from 'vitest'

const STORAGE_KEY = 'insurance-admin-config-v2'

// The store executes loadData() at module load time, so we must re-import it
// fresh for each test after manipulating localStorage.
async function importStore() {
	vi.resetModules()
	return import('../store/insuranceStore')
}

describe('insuranceStore', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	it('falls back to raw JSON when localStorage is empty', async () => {
		const { insuranceData } = await importStore()
		expect(insuranceData.categories.length).toBe(2)
		expect(insuranceData.categories[0].id).toBe('third-party')
	})

	it('loads persisted data from localStorage when present', async () => {
		const saved = {
			categories: [
				{
					id: 'custom-cat',
					name: 'Custom Category',
					types: [],
				},
			],
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
		const { insuranceData } = await importStore()
		expect(insuranceData.categories[0].id).toBe('custom-cat')
		expect(insuranceData.categories[0].name).toBe('Custom Category')
	})

	// Mutation tests use insuranceMutableData (the writable reference)
	it('saveData() writes the current state to localStorage', async () => {
		const { insuranceMutableData, saveData } = await importStore()
		insuranceMutableData.categories[0].name = 'Modified Name'
		saveData()
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
		expect(stored.categories[0].name).toBe('Modified Name')
	})

	it('resetData() restores the original JSON data', async () => {
		const { insuranceData, insuranceMutableData, resetData } = await importStore()
		const originalName = insuranceData.categories[0].name
		insuranceMutableData.categories[0].name = 'Tampered'
		expect(insuranceData.categories[0].name).toBe('Tampered') // readonly proxy reflects mutation
		resetData()
		expect(insuranceData.categories[0].name).toBe(originalName)
	})

	it('resetData() also persists the restored data via saveData()', async () => {
		const { insuranceData, insuranceMutableData, resetData } = await importStore()
		const originalName = insuranceData.categories[0].name
		insuranceMutableData.categories[0].name = 'Tampered'
		resetData()
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
		expect(stored.categories[0].name).toBe(originalName)
	})

	it('falls back to raw JSON when localStorage contains corrupt data', async () => {
		localStorage.setItem(STORAGE_KEY, 'not valid json {{')
		const { insuranceData } = await importStore()
		expect(insuranceData.categories.length).toBe(2)
		expect(insuranceData.categories[0].id).toBe('third-party')
	})
})

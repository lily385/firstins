import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import type { Category } from '../types/insurance'

// ---------------------------------------------------------------------------
// Minimal fixture
// ---------------------------------------------------------------------------

function makeFixture(): { categories: Category[] } {
	return {
		categories: [
			{
				id: 'cat-1',
				name: '第三人責任險',
				types: [
					{
						id: 'main-type',
						name: '第三人主險',
						mainOrAddon: '主險',
						parentMain: null,
						choiceGroup: null,
						defaultChecked: true,
						price: null,
						priceDiscount: null,
						tags: ['保對方'],
						optionMode: null,
						options: [],
						fields: [
							{
								id: 'f-1',
								label: '保額',
								tags: ['對方'],
								selects: [
									{
										id: 's-1',
										choices: ['100萬', '200萬', '300萬'],
										priceDelta: [0, 500, 1200],
										default: '100萬',
									},
								],
							},
						],
					},
					{
						id: 'addon-type',
						name: '超額責任險',
						mainOrAddon: '附加險',
						parentMain: '第三人主險',
						choiceGroup: null,
						defaultChecked: false,
						price: null,
						priceDiscount: null,
						tags: [],
						optionMode: 'radio-always',
						options: [
							{
								id: 'opt-1',
								name: '甲式',
								tags: ['對方'],
								fields: [
									{
										id: 'f-opt-1',
										label: '甲式保額',
										selects: [
											{
												id: 's-opt-1',
												choices: ['1000萬', '2000萬'],
												priceDelta: [0, 300],
												default: '1000萬',
											},
										],
									},
								],
							},
						],
						fields: [],
					},
				],
			},
		],
	}
}

// ---------------------------------------------------------------------------
// Mock the store
// ---------------------------------------------------------------------------

const saveDataMock = vi.fn()
const resetDataMock = vi.fn()
const storeState = reactive(makeFixture())

vi.mock('../store/insuranceStore', () => ({
	insuranceMutableData: storeState,
	saveData: saveDataMock,
	resetData: resetDataMock,
}))

const { default: InsuranceAdmin } = await import('../components/InsuranceAdmin.vue')

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InsuranceAdmin', () => {
	beforeEach(() => {
		const fresh = makeFixture()
		storeState.categories = fresh.categories
		saveDataMock.mockClear()
		resetDataMock.mockClear()
	})

	// ── Tag toggling ──────────────────────────────────────────────────────────

	it('clicking an unselected type tag adds it to type.tags and calls saveData', async () => {
		const wrapper = mount(InsuranceAdmin)
		// main-type already has ['保對方']. Click '保自己' which is not active.
		const tagChips = wrapper.findAll('span.cursor-pointer')
		const targetChip = tagChips.find((c) => c.text() === '保自己')
		expect(targetChip).toBeDefined()
		await targetChip!.trigger('click')
		expect(storeState.categories[0].types[0].tags).toContain('保自己')
		expect(saveDataMock).toHaveBeenCalledOnce()
	})

	it('clicking an active type tag removes it from type.tags', async () => {
		const wrapper = mount(InsuranceAdmin)
		// main-type has '保對方' active
		const tagChips = wrapper.findAll('span.cursor-pointer')
		const targetChip = tagChips.find((c) => c.text() === '保對方')
		expect(targetChip).toBeDefined()
		await targetChip!.trigger('click')
		expect(storeState.categories[0].types[0].tags).not.toContain('保對方')
	})

	// ── Choice editing ────────────────────────────────────────────────────────

	it('changing a choice input updates choices[idx]', async () => {
		const wrapper = mount(InsuranceAdmin)
		const inputs = wrapper.findAll('input[type="text"]')
		// First text input belongs to field f-1, choice[0] = '100萬'
		await inputs[0].setValue('999萬')
		await inputs[0].trigger('change')
		expect(storeState.categories[0].types[0].fields[0].selects[0].choices[0]).toBe('999萬')
	})

	it('changing a choice that was the default also updates default', async () => {
		const wrapper = mount(InsuranceAdmin)
		const inputs = wrapper.findAll('input[type="text"]')
		// choice[0] = '100萬' is also the default
		await inputs[0].setValue('新預設')
		await inputs[0].trigger('change')
		expect(storeState.categories[0].types[0].fields[0].selects[0].default).toBe('新預設')
	})

	it('changing a delta input updates priceDelta[idx]', async () => {
		const wrapper = mount(InsuranceAdmin)
		const numberInputs = wrapper.findAll('input[type="number"]')
		await numberInputs[0].setValue(999)
		await numberInputs[0].trigger('change')
		expect(storeState.categories[0].types[0].fields[0].selects[0].priceDelta![0]).toBe(999)
	})

	// ── Delete choice ─────────────────────────────────────────────────────────

	it('clicking delete removes that choice and its delta', async () => {
		const wrapper = mount(InsuranceAdmin)
		const deleteButtons = wrapper.findAll('button').filter((b) => b.text() === '刪除')
		const beforeLength = storeState.categories[0].types[0].fields[0].selects[0].choices.length
		await deleteButtons[0].trigger('click')
		expect(storeState.categories[0].types[0].fields[0].selects[0].choices.length).toBe(beforeLength - 1)
	})

	it('delete button is disabled when only one choice remains', async () => {
		// Reduce choices to one
		storeState.categories[0].types[0].fields[0].selects[0].choices = ['只剩一個']
		storeState.categories[0].types[0].fields[0].selects[0].priceDelta = [0]
		const wrapper = mount(InsuranceAdmin)
		const deleteButtons = wrapper.findAll('button').filter((b) => b.text() === '刪除')
		expect((deleteButtons[0].element as HTMLButtonElement).disabled).toBe(true)
	})

	// ── Add choice ────────────────────────────────────────────────────────────

	it('clicking + 新增選項 appends an empty choice with zero delta', async () => {
		const wrapper = mount(InsuranceAdmin)
		const addButtons = wrapper.findAll('button').filter((b) => b.text().includes('新增選項'))
		const sel = storeState.categories[0].types[0].fields[0].selects[0]
		const beforeLength = sel.choices.length
		await addButtons[0].trigger('click')
		expect(sel.choices.length).toBe(beforeLength + 1)
		expect(sel.choices[sel.choices.length - 1]).toBe('')
		expect(sel.priceDelta![sel.priceDelta!.length - 1]).toBe(0)
	})

	// ── Reset ─────────────────────────────────────────────────────────────────

	it('clicking reset and confirming calls resetData', async () => {
		vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
		const wrapper = mount(InsuranceAdmin)
		const resetBtn = wrapper.find('button.text-red-600')
		await resetBtn.trigger('click')
		expect(resetDataMock).toHaveBeenCalledOnce()
		vi.unstubAllGlobals()
	})

	it('clicking reset and cancelling does not call resetData', async () => {
		vi.stubGlobal('confirm', vi.fn().mockReturnValue(false))
		const wrapper = mount(InsuranceAdmin)
		const resetBtn = wrapper.find('button.text-red-600')
		await resetBtn.trigger('click')
		expect(resetDataMock).not.toHaveBeenCalled()
		vi.unstubAllGlobals()
	})
})

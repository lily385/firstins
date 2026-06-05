import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive, nextTick } from 'vue'
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
				addonSectionLabel: '第三人附加',
				addonSectionNote: '選擇主險後才能加買',
				types: [
					{
						id: 'main-type',
						name: '第三人主險',
						mainOrAddon: '主險',
						parentMain: null,
						choiceGroup: null,
						defaultChecked: true,
						price: 6000,
						priceDiscount: 5000,
						tags: [],
						optionMode: null,
						description: '本車外的所有人都是第三人',
						tooltip: undefined,
						options: [],
						fields: [
							{
								id: 'f-1',
								label: '保額',
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
						id: 'addon-a',
						name: '附加險A',
						mainOrAddon: '附加險',
						parentMain: '第三人主險',
						choiceGroup: 'GROUP-X',
						defaultChecked: true,
						price: null,
						priceDiscount: null,
						tags: [],
						optionMode: 'radio-always',
						tooltip: undefined,
						options: [
							{
								id: 'opt-a1',
								name: '選項 A-甲',
								tags: [],
								fields: [
									{
										id: 'f-a1',
										label: '保額A甲',
										selects: [
											{
												id: 's-a1',
												choices: ['1000萬', '2000萬'],
												priceDelta: [0, 300],
												default: '1000萬',
											},
										],
									},
								],
							},
							{
								id: 'opt-a2',
								name: '選項 A-乙',
								tags: [],
								fields: [
									{
										id: 'f-a2',
										label: '保額A乙',
										selects: [
											{
												id: 's-a2',
												choices: ['500萬', '1000萬'],
												priceDelta: [0, 200],
												default: '500萬',
											},
										],
									},
								],
							},
						],
						fields: [],
					},
					{
						id: 'addon-b',
						name: '附加險B',
						mainOrAddon: '附加險',
						parentMain: '第三人主險',
						choiceGroup: 'GROUP-X',
						defaultChecked: false,
						price: null,
						priceDiscount: null,
						tags: [],
						optionMode: null,
						tooltip: undefined,
						options: [],
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

const storeState = reactive(makeFixture())

vi.mock('../store/insuranceStore', () => ({
	insuranceData: storeState,
	saveData: vi.fn(),
}))

// Import component AFTER mocking
const { default: InsuranceForm } = await import('../components/InsuranceForm.vue')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function freshMount() {
	// Reset fixture state before each mount
	const fresh = makeFixture()
	storeState.categories = fresh.categories
	return mount(InsuranceForm)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InsuranceForm', () => {
	beforeEach(() => {
		const fresh = makeFixture()
		storeState.categories = fresh.categories
	})

	it('renders the main category header with dark background', () => {
		const wrapper = freshMount()
		const header = wrapper.find('.bg-gray-700')
		expect(header.exists()).toBe(true)
		expect(header.text()).toContain('第三人責任險')
	})

	it('renders the addon sub-section header with addonSectionLabel and note', () => {
		const wrapper = freshMount()
		const subHeader = wrapper.find('.bg-gray-200')
		expect(subHeader.exists()).toBe(true)
		expect(subHeader.text()).toContain('第三人附加')
		expect(subHeader.text()).toContain('選擇主險後才能加買')
	})

	it('collapses expanded content when a type is unchecked', async () => {
		const wrapper = freshMount()
		// main-type is defaultChecked: true — record selects count before
		const beforeCount = wrapper.findAll('select').length
		expect(beforeCount).toBeGreaterThan(0)
		// Uncheck main-type
		const checkboxes = wrapper.findAll('input[type="checkbox"]')
		await checkboxes[0].trigger('change')
		await nextTick()
		// After unchecking, the v-if section collapses — fewer selects rendered
		const afterCount = wrapper.findAll('select').length
		expect(afterCount).toBeLessThan(beforeCount)
		// And the checkbox element itself reflects the new unchecked state
		expect((checkboxes[0].element as HTMLInputElement).checked).toBe(false)
	})

	it('choiceGroup: checking addon-b unchecks addon-a', async () => {
		const wrapper = freshMount()
		// addon-a (idx 1) is checked; addon-b (idx 2) is not
		const checkboxes = wrapper.findAll('input[type="checkbox"]')
		// Trigger addon-b checkbox (index 2)
		await checkboxes[2].trigger('change')
		await nextTick()
		// addon-a should now be unchecked in state
		expect(storeState.categories[0].types[1].id).toBe('addon-a')
		// The storeState reactive object should reflect the mutual exclusion
		const addonACheckbox = checkboxes[1]
		expect((addonACheckbox.element as HTMLInputElement).checked).toBe(false)
	})

	it('parentMain: addon row is grayed when parent main is unchecked', async () => {
		const wrapper = freshMount()
		const checkboxes = wrapper.findAll('input[type="checkbox"]')
		// Uncheck main-type (index 0)
		await checkboxes[0].trigger('change')
		await nextTick()
		// addon rows should have opacity-40
		const rows = wrapper.findAll('.transition-opacity')
		expect(rows[1].classes()).toContain('opacity-40')
	})

	it('parentMain: addon row re-enables after re-checking main', async () => {
		const wrapper = freshMount()
		const checkboxes = wrapper.findAll('input[type="checkbox"]')
		// Uncheck then re-check main
		await checkboxes[0].trigger('change')
		await nextTick()
		await checkboxes[0].trigger('change')
		await nextTick()
		const rows = wrapper.findAll('.transition-opacity')
		expect(rows[1].classes()).not.toContain('opacity-40')
	})

	it('radio-always: both option names are visible when type is checked', async () => {
		const wrapper = freshMount()
		// addon-a is defaultChecked: true and optionMode: radio-always
		const text = wrapper.text()
		expect(text).toContain('選項 A-甲')
		expect(text).toContain('選項 A-乙')
	})

	it('renders discount price and strikethrough original price', () => {
		const wrapper = freshMount()
		// main-type has price:6000 and priceDiscount:5000
		expect(wrapper.find('.line-through').exists()).toBe(true)
		expect(wrapper.text()).toContain('網路優惠')
	})

	it('description note is shown in orange text', () => {
		const wrapper = freshMount()
		const note = wrapper.find('.text-orange-500')
		expect(note.exists()).toBe(true)
		expect(note.text()).toContain('本車外的所有人都是第三人')
	})
})

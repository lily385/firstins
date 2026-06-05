import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InfoTooltip from '../components/InfoTooltip.vue'

describe('InfoTooltip', () => {
	it('renders nothing when no text prop is provided', () => {
		const wrapper = mount(InfoTooltip)
		expect(wrapper.find('span').exists()).toBe(false)
	})

	it('renders the i icon element when text prop is provided', () => {
		const wrapper = mount(InfoTooltip, {
			props: { text: '這是一個提示' },
		})
		// The outer span should exist
		expect(wrapper.find('span').exists()).toBe(true)
		// The inner icon span should contain 'i'
		const iconSpan = wrapper.findAll('span').find((s) => s.text() === 'i')
		expect(iconSpan).toBeDefined()
	})

	it('tooltip text is present in the DOM', () => {
		const tooltipText = '承保範圍說明文字'
		const wrapper = mount(InfoTooltip, {
			props: { text: tooltipText },
		})
		expect(wrapper.text()).toContain(tooltipText)
	})
})

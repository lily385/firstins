export interface SelectDef {
	id: string
	choices: string[]
	priceDelta?: number[]
	default: string
}

export interface FieldDef {
	id: string
	label: string
	tooltip?: string
	tags?: string[]
	selects: SelectDef[]
}

export interface OptionDef {
	id: string
	name: string
	tooltip?: string
	tags: string[]
	fields: FieldDef[]
}

export interface InsuranceType {
	id: string
	name: string
	description?: string
	tooltip?: string
	parentMain: string | null
	choiceGroup: string | null
	defaultChecked: boolean
	price: number | null
	priceDiscount: number | null
	tags: string[]
	optionMode: 'radio' | 'radio-always' | 'always' | null
	options: OptionDef[]
	fields: FieldDef[]
	mainOrAddon: '主險' | '附加險'
}

export interface Category {
	id: string
	name: string
	note?: string
	addonSectionLabel?: string
	addonSectionNote?: string
	types: InsuranceType[]
}

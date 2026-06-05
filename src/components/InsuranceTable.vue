<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4 text-gray-800">分類、險種 &amp; 選項</h2>
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="bg-gray-100 text-left">
          <th class="border border-gray-300 px-3 py-2 w-28">分類</th>
          <th class="border border-gray-300 px-3 py-2">險種</th>
          <th class="border border-gray-300 px-3 py-2">險種選項</th>
          <th class="border border-gray-300 px-3 py-2 w-24">主/附加險</th>
          <th class="border border-gray-300 px-3 py-2 w-28">主險</th>
          <th class="border border-gray-300 px-3 py-2 w-24">擇一</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in flatRows" :key="row.rowKey" class="hover:bg-gray-50">
          <td
            v-if="row.showCategory"
            :rowspan="row.categoryRowspan"
            class="border border-gray-300 px-3 py-2 font-medium text-blue-700 align-top"
          >
            {{ row.categoryName }}
          </td>
          <td
            v-if="row.showType"
            :rowspan="row.typeRowspan"
            class="border border-gray-300 px-3 py-2 align-top"
          >
            {{ row.typeName }}
          </td>
          <td class="border border-gray-300 px-3 py-2 text-gray-600">
            {{ row.optionName ?? '-' }}
          </td>
          <td class="border border-gray-300 px-3 py-2">
            <span
              :class="row.mainOrAddon === '主險'
                ? 'text-green-700 font-medium'
                : 'text-orange-600'"
            >
              {{ row.mainOrAddon }}
            </span>
          </td>
          <td class="border border-gray-300 px-3 py-2 text-gray-500">
            {{ row.parentMain ?? '' }}
          </td>
          <td class="border border-gray-300 px-3 py-2 text-gray-500">
            {{ row.choiceGroup ?? '' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import insuranceData from '../data/insurance.json'

interface Option {
  id: string
  name: string
}

interface InsuranceType {
  id: string
  name: string
  mainOrAddon: string
  parentMain: string | null
  choiceGroup: string | null
  options: Option[]
}

interface Category {
  id: string
  name: string
  types: InsuranceType[]
}

interface FlatRow {
  rowKey: string
  showCategory: boolean
  categoryRowspan: number
  categoryName: string
  showType: boolean
  typeRowspan: number
  typeName: string
  optionName: string | null
  mainOrAddon: string
  parentMain: string | null
  choiceGroup: string | null
}

const flatRows = computed<FlatRow[]>(() => {
  const rows: FlatRow[] = []

  for (const cat of (insuranceData as { categories: Category[] }).categories) {
    // total rows this category spans
    const catRowspan = cat.types.reduce(
      (sum, t) => sum + Math.max(1, t.options.length),
      0
    )
    let catFirstRow = true

    for (const type of cat.types) {
      const typeRowspan = Math.max(1, type.options.length)
      let typeFirstRow = true

      const optionList: Array<string | null> =
        type.options.length > 0 ? type.options.map((o) => o.name) : [null]

      for (const optName of optionList) {
        rows.push({
          rowKey: `${cat.id}-${type.id}-${optName ?? 'none'}`,
          showCategory: catFirstRow,
          categoryRowspan: catRowspan,
          categoryName: cat.name,
          showType: typeFirstRow,
          typeRowspan,
          typeName: type.name,
          optionName: optName,
          mainOrAddon: type.mainOrAddon,
          parentMain: type.parentMain,
          choiceGroup: type.choiceGroup,
        })
        catFirstRow = false
        typeFirstRow = false
      }
    }
  }

  return rows
})
</script>
